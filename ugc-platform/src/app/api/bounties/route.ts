import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabase-server'
import { requireRole } from '@/lib/role-utils'
import type { Database } from '@/types/database.types'

type BountyRow = Database['public']['Tables']['bounties']['Row']
type SubmissionRow = Database['public']['Tables']['submissions']['Row']

interface BountyWithSubmissions extends BountyRow {
  submissions?: SubmissionRow[]
}

interface BountyWithProgress extends BountyRow {
  calculated_claimed_bounty: number
  progress_percentage: number
  total_submission_views: number
  is_completed: boolean
}

/**
 * GET /api/bounties
 * Fetch all bounties with calculated progress from submissions
 */
export async function GET() {
  try {
    const { data: bounties, error } = await supabaseServer
      .from('bounties')
      .select(`
        *,
        submissions (
          id,
          view_count,
          status
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching bounties:', error)
      return NextResponse.json(
        { error: 'Failed to fetch bounties' },
        { status: 500 }
      )
    }

    // Calculate progress based purely on submissions' view counts
    const bountiesWithProgress: BountyWithProgress[] = (bounties as BountyWithSubmissions[])?.map(bounty => {
      const approvedSubmissions = bounty.submissions?.filter(
        (submission) => submission.status === 'approved'
      ) || []
      
      const totalViews = approvedSubmissions.reduce(
        (sum: number, submission) => sum + (Number(submission.view_count) || 0), 
        0
      )
      
      // Calculate how much bounty has been "used" based purely on views
      // Formula: (totalViews / 1000) * ratePer1kViews
      const usedBounty = (totalViews / 1000) * Number(bounty.rate_per_1k_views)
      const totalBounty = Number(bounty.total_bounty)
      
      // Cap the used bounty at the total bounty amount
      const cappedUsedBounty = Math.min(usedBounty, totalBounty)
      
      // Calculate progress percentage (will be 100% if views exceed total)
      // Handle division by zero: if total_bounty is 0, set progress to 0
      const progressPercentage = totalBounty > 0 
        ? Math.min((usedBounty / totalBounty) * 100, 100)
        : 0
      
      return {
        ...bounty,
        // Remove dependency on stored claimed_bounty - use only calculated values
        calculated_claimed_bounty: cappedUsedBounty,
        progress_percentage: progressPercentage,
        total_submission_views: totalViews,
        is_completed: usedBounty >= Number(bounty.total_bounty)
      }
    }) || []

    return NextResponse.json(bountiesWithProgress)
  } catch (error) {
    console.error('Error in GET /api/bounties:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/bounties
 * Create a new bounty with creator_id from Clerk authentication
 */
export async function POST(request: Request) {
  try {
    // Get the authenticated user
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to create a bounty.' },
        { status: 401 }
      )
    }

    // Check if user is a business (only businesses can create bounties)
    const isBusiness = await requireRole('business', userId)
    if (!isBusiness) {
      return NextResponse.json(
        { error: 'Forbidden. Only businesses can create bounties. Creators can submit to bounties.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, instructions, totalBounty, ratePer1kViews, companyName, logoUrl } = body

    // Validate required fields
    if (!name || !description || totalBounty === undefined || ratePer1kViews === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields. Required: name, description, totalBounty, ratePer1kViews. Instructions is optional.' },
        { status: 400 }
      )
    }

    // Validate numeric fields
    if (typeof totalBounty !== 'number' || totalBounty <= 0) {
      return NextResponse.json(
        { error: 'totalBounty must be a positive number' },
        { status: 400 }
      )
    }

    if (typeof ratePer1kViews !== 'number' || ratePer1kViews <= 0) {
      return NextResponse.json(
        { error: 'ratePer1kViews must be a positive number' },
        { status: 400 }
      )
    }

    // Validate logoUrl if provided - ensure it's from Supabase storage
    if (logoUrl) {
      if (typeof logoUrl !== 'string') {
        return NextResponse.json(
          { error: 'logoUrl must be a string' },
          { status: 400 }
        )
      }

      try {
        const url = new URL(logoUrl)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        if (!supabaseUrl) {
          return NextResponse.json(
            { error: 'Server configuration error' },
            { status: 500 }
          )
        }

        // Ensure logoUrl is from Supabase storage
        const supabaseHostname = new URL(supabaseUrl).hostname
        const logoHostname = url.hostname
        
        // Check if URL is from Supabase storage (storage.supabase.co or project's Supabase URL)
        if (!logoHostname.includes('supabase.co') && logoHostname !== supabaseHostname) {
          return NextResponse.json(
            { error: 'Invalid logo URL. Logo must be uploaded through the platform.' },
            { status: 400 }
          )
        }

        // Ensure it's using HTTPS
        if (url.protocol !== 'https:') {
          return NextResponse.json(
            { error: 'Logo URL must use HTTPS' },
            { status: 400 }
          )
        }
      } catch {
        return NextResponse.json(
          { error: 'Invalid logo URL format' },
          { status: 400 }
        )
      }
    }

    // Prepare insert data - map camelCase to snake_case
    // Note: company_name, logo_url, and instructions are optional
    // If they don't exist in schema, they'll be ignored by Supabase
    const insertData: Database['public']['Tables']['bounties']['Insert'] = {
      name,
      description,
      total_bounty: totalBounty,
      rate_per_1k_views: ratePer1kViews,
      claimed_bounty: 0,
      creator_id: userId,
      // Only include optional fields if they're provided
      ...(companyName && { company_name: companyName }),
      ...(logoUrl && { logo_url: logoUrl }),
      // Instructions is optional - include if provided, otherwise null
      instructions: instructions && instructions.trim() ? instructions.trim() : null,
    }

    // Insert bounty into database with creator_id
    const { data, error } = await supabaseServer
      .from('bounties')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Error creating bounty:', error)
      
      // Handle case where company_name or logo_url columns don't exist
      if (error.message?.includes('column') && (error.message?.includes('company_name') || error.message?.includes('logo_url'))) {
        // Retry without optional fields
        const { data: retryData, error: retryError } = await supabaseServer
          .from('bounties')
          .insert({
            name,
            description,
            total_bounty: totalBounty,
            rate_per_1k_views: ratePer1kViews,
            claimed_bounty: 0,
            creator_id: userId,
          })
          .select()
          .single()

        if (retryError) {
          console.error('Error creating bounty (retry):', retryError)
          return NextResponse.json(
            { error: 'Failed to create bounty' },
            { status: 500 }
          )
        }

        return NextResponse.json(retryData, { status: 201 })
      }

      return NextResponse.json(
        { error: 'Failed to create bounty' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/bounties:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/bounties
 * Update a bounty (name, description, and instructions, only by owner)
 */
export async function PUT(request: Request) {
  try {
    // Get the authenticated user
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to update a bounty.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, name, description, instructions } = body

    // Validate required fields
    if (!id || (!name && !description && instructions === undefined)) {
      return NextResponse.json(
        { error: 'Missing required fields. Need bounty id and at least name, description, or instructions.' },
        { status: 400 }
      )
    }

    // First, check if the user is the owner of the bounty
    const { data: bounty, error: fetchError } = await supabaseServer
      .from('bounties')
      .select('creator_id')
      .eq('id', id)
      .single()

    if (fetchError || !bounty) {
      return NextResponse.json(
        { error: 'Bounty not found' },
        { status: 404 }
      )
    }

    if (bounty.creator_id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden. You can only edit your own bounties.' },
        { status: 403 }
      )
    }

    // Update name, description, and/or instructions
    const updateData: { name?: string; description?: string; instructions?: string | null } = {}
    if (name) updateData.name = name
    if (description) updateData.description = description
    // Instructions can be explicitly set to null (empty string means null)
    if (instructions !== undefined) {
      updateData.instructions = instructions && instructions.trim() ? instructions.trim() : null
    }

    const { data, error } = await supabaseServer
      .from('bounties')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating bounty:', error)
      return NextResponse.json(
        { error: 'Failed to update bounty' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in PUT /api/bounties:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

