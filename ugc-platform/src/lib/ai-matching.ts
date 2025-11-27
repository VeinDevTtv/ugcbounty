import { GoogleGenerativeAI, SchemaType, Schema } from '@google/generative-ai'
import type { CreatorProfile, AIMatchResult, BountyWithProgress } from '@/types/recommendations'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

const matchResultSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    matchScore: {
      type: SchemaType.NUMBER,
      description: 'Match score from 0-100 indicating how well this bounty matches the creator'
    },
    reasons: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.STRING
      },
      description: 'Array of 3-5 specific reasons why this bounty matches the creator'
    },
    platformCompatibility: {
      type: SchemaType.BOOLEAN,
      description: 'Whether the creator has experience with the platform(s) this bounty targets'
    },
    contentStyleAlignment: {
      type: SchemaType.BOOLEAN,
      description: 'Whether the creator\'s content style aligns with what this bounty requires'
    },
    explanation: {
      type: SchemaType.STRING,
      description: 'Brief explanation of the match assessment'
    }
  },
  required: ['matchScore', 'reasons', 'platformCompatibility', 'contentStyleAlignment', 'explanation']
}

/**
 * Analyze creator profile and match against a bounty using Gemini AI
 */
export async function matchCreatorToBounty(
  creatorProfile: CreatorProfile,
  bounty: BountyWithProgress
): Promise<AIMatchResult> {
  // Check for Gemini API key
  if (!process.env.GEMINI_API_KEY) {
    console.warn('Gemini API key not configured, using fallback scoring')
    return getFallbackMatch(creatorProfile, bounty)
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: matchResultSchema
      }
    })

    // Build creator content summary
    const creatorSummary = buildCreatorSummary(creatorProfile)
    
    // Build bounty summary
    const bountySummary = buildBountySummary(bounty)

    const prompt = `
You are an AI recommendation engine for a UGC (User-Generated Content) bounty platform. Your job is to analyze a creator's past content and determine how well they match a specific bounty opportunity.

CREATOR PROFILE:
${creatorSummary}

BOUNTY OPPORTUNITY:
${bountySummary}

ANALYSIS TASK:
Analyze how well this creator matches this bounty opportunity. Consider:
1. **Platform Compatibility**: Does the creator have experience creating content on the platforms this bounty targets? (YouTube, TikTok, Instagram)
2. **Content Style Match**: Does the creator's past content style, themes, and approach align with what this bounty requires?
3. **Performance Potential**: Based on the creator's past performance (view counts, success rate), are they likely to succeed with this bounty?
4. **Content Themes**: Do the themes and topics in the creator's past submissions align with this bounty's focus?

MATCH SCORING GUIDELINES:
- 90-100: Excellent match - Creator has strong platform experience, content style perfectly aligns, high success potential
- 70-89: Good match - Creator has relevant experience and style, good success potential
- 50-69: Moderate match - Some alignment but may need to adapt style or platform
- 30-49: Weak match - Limited alignment, creator would need significant adaptation
- 0-29: Poor match - Little to no alignment

REASONS TO PROVIDE:
Provide 3-5 specific, actionable reasons why this bounty matches (or doesn't match) the creator. Examples:
- "Matches your YouTube content style with educational tech reviews"
- "Your past TikTok videos show strong performance in product demonstrations"
- "Your average view count of 50k aligns well with this bounty's target audience"
- "Content themes match - you've created similar tech product reviews before"
- "Platform mismatch - this bounty targets Instagram but you primarily create YouTube content"

Be specific and reference actual data from the creator profile when possible.
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    const parsedResponse = JSON.parse(text) as AIMatchResult
    
    // Ensure match score is within bounds
    parsedResponse.matchScore = Math.max(0, Math.min(100, parsedResponse.matchScore))
    
    return parsedResponse
  } catch (error) {
    console.error('Error in AI matching:', error)
    // Fall back to rule-based matching
    return getFallbackMatch(creatorProfile, bounty)
  }
}

/**
 * Build a summary string of the creator's profile for AI analysis
 */
function buildCreatorSummary(profile: CreatorProfile): string {
  const platforms = profile.platforms.join(', ')
  const topSubmissions = profile.topPerformingSubmissions
    .slice(0, 5)
    .map(s => `- "${s.title || 'Untitled'}" (${s.viewCount.toLocaleString()} views, ${s.platform})`)
    .join('\n')
  
  return `
Platforms Used: ${platforms}
Platform Distribution: ${JSON.stringify(profile.platformDistribution)}
Total Submissions: ${profile.totalSubmissions}
Approved Submissions: ${profile.approvedSubmissions}
Success Rate: ${(profile.successRate * 100).toFixed(1)}%
Average View Count: ${profile.avgViewCount.toLocaleString()}

Top Performing Submissions:
${topSubmissions}

Recent Submission Titles:
${profile.submissionTitles.slice(0, 10).map(t => `- ${t}`).join('\n')}

Content Themes: ${profile.contentThemes.join(', ') || 'Not yet analyzed'}
`
}

/**
 * Build a summary string of the bounty for AI analysis
 */
function buildBountySummary(bounty: BountyWithProgress): string {
  return `
Bounty Name: ${bounty.name}
Description: ${bounty.description}
Instructions: ${bounty.instructions || 'No specific instructions'}
Total Bounty: $${bounty.total_bounty.toLocaleString()}
Rate per 1k Views: $${bounty.rate_per_1k_views.toLocaleString()}
Progress: ${bounty.progress_percentage.toFixed(1)}% complete
Company: ${bounty.company_name || 'Unknown'}
`
}

/**
 * Fallback matching when AI is unavailable - uses rule-based scoring
 */
function getFallbackMatch(
  creatorProfile: CreatorProfile,
  bounty: BountyWithProgress
): AIMatchResult {
  let score = 50 // Base score
  const reasons: string[] = []
  let platformCompatibility = false
  let contentStyleMatch = false

  // Platform matching (simple check - if creator has used any platform, give points)
  if (creatorProfile.platforms.length > 0) {
    platformCompatibility = true
    score += 20
    reasons.push(`You have experience creating content on ${creatorProfile.platforms.join(', ')}`)
  }

  // Performance matching
  if (creatorProfile.avgViewCount > 1000) {
    score += 15
    reasons.push(`Your average view count of ${creatorProfile.avgViewCount.toLocaleString()} shows strong performance`)
  }

  // Success rate matching
  if (creatorProfile.successRate > 0.7) {
    score += 10
    reasons.push(`High approval rate of ${(creatorProfile.successRate * 100).toFixed(0)}%`)
  }

  // Content style (basic keyword matching)
  const bountyText = `${bounty.name} ${bounty.description} ${bounty.instructions || ''}`.toLowerCase()
  const creatorThemes = creatorProfile.contentThemes.join(' ').toLowerCase()
  
  if (creatorThemes && bountyText) {
    // Simple keyword overlap check
    const bountyWords = new Set(bountyText.split(/\s+/))
    const creatorWords = new Set(creatorThemes.split(/\s+/))
    const overlap = [...bountyWords].filter(w => creatorWords.has(w) && w.length > 3).length
    
    if (overlap > 0) {
      contentStyleMatch = true
      score += 15
      reasons.push('Content themes align with this bounty')
    }
  }

  // Cap score at 100
  score = Math.min(100, score)

  return {
    matchScore: score,
    reasons: reasons.length > 0 ? reasons : ['General recommendation based on your profile'],
    platformCompatibility,
    contentStyleAlignment: contentStyleMatch,
    explanation: `Fallback matching: ${reasons.join('; ')}`
  }
}

/**
 * Batch match creator to multiple bounties (optimized for API efficiency)
 */
export async function matchCreatorToBounties(
  creatorProfile: CreatorProfile,
  bounties: BountyWithProgress[]
): Promise<Array<{ bounty: BountyWithProgress; match: AIMatchResult }>> {
  // For now, process sequentially to avoid rate limits
  // In the future, could batch multiple bounties in one Gemini call
  const results = await Promise.allSettled(
    bounties.map(async (bounty) => {
      const match = await matchCreatorToBounty(creatorProfile, bounty)
      return { bounty, match }
    })
  )

  return results
    .filter((r): r is PromiseFulfilledResult<{ bounty: BountyWithProgress; match: AIMatchResult }> => 
      r.status === 'fulfilled'
    )
    .map(r => r.value)
}

