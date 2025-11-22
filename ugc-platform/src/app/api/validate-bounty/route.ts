import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { GoogleGenerativeAI, SchemaType, Schema } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

interface ValidationRequest {
  url: string
  requirements: string
}

interface ValidationResponse {
  valid: boolean
  explanation: string
}

const validationSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    valid: {
      type: SchemaType.BOOLEAN,
      description: 'Whether the video meets ALL specified bounty requirements with 100% exact matching of every detail. Must be false if ANY specific detail is missing, incorrect, or replaced with something similar.'
    },
    explanation: {
      type: SchemaType.STRING,
      description: 'Brief explanation of why the video meets or doesn\'t meet the requirements'
    }
  },
  required: ['valid', 'explanation']
}

/**
 * Validate if URL is a YouTube URL
 */
function isValidYouTubeUrl(url: string): boolean {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
  return youtubeRegex.test(url)
}

/**
 * POST /api/validate-bounty
 * Validate YouTube video against bounty requirements using Google Gemini AI
 * 
 * Request body:
 * {
 *   "url": "https://www.youtube.com/watch?v=...",
 *   "requirements": "Bounty description/requirements text"
 * }
 * 
 * Response:
 * {
 *   "valid": boolean,
 *   "explanation": string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Validate bounty API called')
    const body: ValidationRequest = await request.json()
    const { url, requirements } = body

    console.log('Validation request:', { url, requirements })

    // Validate required fields
    if (!url || !requirements) {
      console.log('Error: Missing required fields - url:', !!url, 'requirements:', !!requirements)
      return NextResponse.json(
        { error: 'URL and requirements are required' },
        { status: 400 }
      )
    }

    // Validate YouTube URL
    if (!isValidYouTubeUrl(url)) {
      console.log('Error: Invalid YouTube URL:', url)
      return NextResponse.json({
        valid: false,
        explanation: 'URL must be a valid YouTube video URL'
      } as ValidationResponse)
    }

    // Check for Gemini API key
    if (!process.env.GEMINI_API_KEY) {
      console.log('Error: Gemini API key not configured')
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    // Initialize Gemini model with structured output schema
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: validationSchema
      }
    })

    const prompt = `
You are a strict content moderator reviewing a YouTube video submission for a UGC bounty program. Your job is to ensure that the video meets EVERY SINGLE requirement with 100% accuracy. You must verify that ALL specific details match EXACTLY as described in the requirements.

BOUNTY REQUIREMENTS: ${requirements}

CRITICAL: EXACT MATCHING REQUIREMENT
You MUST verify that EVERY specific detail mentioned in the requirements appears EXACTLY as described. This includes:
- Specific product names, brands, or items (e.g., "clerk builder mode hat" means EXACTLY that hat, not a similar hat)
- Colors, designs, logos, or visual elements
- Text, slogans, or phrases that must appear
- Actions, demonstrations, or behaviors required
- Any other specific details mentioned

STRICT VALIDATION PROCESS:
1. **Extract All Specific Details**: First, identify EVERY specific detail mentioned in the requirements (products, colors, brands, text, actions, etc.)
2. **Visual Examination**: Carefully examine ALL visual elements in the video:
   - Products shown (are they the EXACT items mentioned?)
   - Clothing/accessories (do they match EXACTLY what's required?)
   - Colors, logos, branding (are they EXACTLY as specified?)
   - Text or phrases (do they appear EXACTLY as written?)
   - Actions or demonstrations (are they performed EXACTLY as required?)
3. **Exact Match Verification**: For each specific detail, verify it appears EXACTLY as described:
   - If requirements say "clerk builder mode hat", the video MUST show that EXACT hat, not a different hat
   - If requirements mention a specific color, brand, or design, it MUST match EXACTLY
   - Similar items are NOT acceptable - only exact matches
4. **Completeness Check**: Ensure ALL requirements are met, not just some

VALIDATION CRITERIA - The video must meet ALL of these:
- **100% Exact Matching**: EVERY specific detail from requirements appears EXACTLY as described (not similar, not approximate - EXACT)
- **Primary Focus**: The bounty requirement must be a CORE element of the video, prominently featured throughout
- **Meaningful Engagement**: Required items/products are actively used, demonstrated, or prominently featured
- **Content Value**: The video provides genuine entertainment or educational value to viewers
- **Brand Alignment**: The content positively represents the brand and product

MANDATORY REJECTION CRITERIA - Reject if ANY of these apply:
- ANY specific detail from requirements is missing, incorrect, or replaced with something similar
- Product/item shown is similar but not the EXACT item mentioned in requirements
- Required colors, logos, text, or visual elements don't match EXACTLY
- Product shown for less than 10% of video duration without meaningful context
- Requirement mentioned only briefly without demonstration or explanation
- Video's main purpose is unrelated to the bounty requirement
- Product appears as background prop without active engagement
- Content feels forced or inauthentic
- Video lacks genuine value beyond showing the required item

EXAMPLES OF EXACT VS. APPROXIMATE MATCHING:
- Requirement: "wearing a clerk builder mode hat"
  - EXACT MATCH: Video shows the exact "clerk builder mode hat" ✓
  - REJECT: Video shows a different hat, even if similar ✗
  - REJECT: Video shows a hat but not the specific "clerk builder mode hat" ✗

- Requirement: "using Product X in blue color"
  - EXACT MATCH: Video shows Product X in blue ✓
  - REJECT: Video shows Product X but in a different color ✗
  - REJECT: Video shows a similar product in blue ✗

- Requirement: "displaying the brand logo prominently"
  - EXACT MATCH: Video shows the exact brand logo clearly visible ✓
  - REJECT: Video shows a similar logo or no logo ✗

VALIDATION RESPONSE RULES:
- Set valid=true ONLY if ALL criteria are met AND every specific detail matches EXACTLY
- Set valid=false if ANY detail doesn't match exactly, even if the video is otherwise good
- When rejecting, specify EXACTLY which detail(s) don't match and what was shown instead
- Provide clear, actionable feedback that helps creators understand what needs to be exact

Example feedback format for creators:
- "The video shows a hat, but it's not the required 'clerk builder mode hat'. You must wear the EXACT hat specified in the requirements."
- "The video shows Product X, but it's in red instead of the required blue color. The color must match EXACTLY."
- "The video needs to display the brand logo prominently as required. Currently, the logo is not visible or is different from what's specified."
- "The video shows a similar product, but the requirements specify Product X. You must use the EXACT product mentioned."

Remember: Similar is NOT good enough. Only EXACT matches are acceptable. Be strict and thorough in your verification.
`

    console.log('Calling Gemini with video analysis for URL:', url)

    const result = await model.generateContent([
      {
        fileData: {
          fileUri: url,
          mimeType: 'video/youtube'
        }
      },
      {
        text: prompt
      }
    ])

    const response = await result.response
    const text = response.text()

    console.log('Gemini response:', text)

    const parsedResponse = JSON.parse(text)
    console.log('Parsed response:', parsedResponse)

    return NextResponse.json(parsedResponse as ValidationResponse)
  } catch (error) {
    console.error('Error validating bounty:', error)
    
    // Type guard for error with status property
    const hasStatus = (e: unknown): e is { status?: number; message?: string } => {
      return typeof e === 'object' && e !== null && ('status' in e || 'message' in e)
    }
    
    const errorObj = hasStatus(error) ? error : { message: String(error) }
    
    // Handle specific Gemini API errors
    if (errorObj.status === 503 || 
        errorObj.message?.includes('overloaded') || 
        errorObj.message?.includes('Service Unavailable')) {
      return NextResponse.json({
        valid: false,
        explanation: 'The AI validation service is currently overloaded. Please try again in a few moments.'
      } as ValidationResponse)
    }
    
    if (errorObj.status === 429 || 
        errorObj.message?.includes('rate limit') || 
        errorObj.message?.includes('quota')) {
      return NextResponse.json({
        valid: false,
        explanation: 'Too many validation requests. Please wait a moment and try again.'
      } as ValidationResponse)
    }
    
    if (errorObj.message?.includes('API key') || 
        errorObj.status === 401 || 
        errorObj.status === 403) {
      console.error('Gemini API authentication error:', error)
      return NextResponse.json(
        { error: 'AI validation service configuration error. Please contact support.' },
        { status: 500 }
      )
    }
    
    // For other errors, return a user-friendly validation response
    // This ensures the frontend can display the error properly
    return NextResponse.json({
      valid: false,
      explanation: 'Unable to validate video at this time. Please try again later or contact support if the issue persists.'
    } as ValidationResponse)
  }
}
