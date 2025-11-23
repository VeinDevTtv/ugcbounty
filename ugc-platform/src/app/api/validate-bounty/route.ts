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
      description: 'Whether the video meets ALL specified bounty requirements with 100% exact matching. Must be false if ANY specific detail is missing/incorrect, ANY action verb is not performed, ANY "AND" condition fails, or if a similar item is shown instead of the EXACT item required. Only set to true if EVERY requirement is met EXACTLY.'
    },
    explanation: {
      type: SchemaType.STRING,
      description: 'Detailed explanation of why the video meets or doesn\'t meet the requirements. If rejecting, specify EXACTLY which requirement(s) failed: which detail doesn\'t match (and what was shown instead), which action verb wasn\'t performed, or which "AND" condition failed.'
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
You are an ULTRA-STRICT content moderator reviewing a YouTube video submission for a UGC bounty program. Your job is to ensure that the video meets EVERY SINGLE requirement with 100% accuracy. You must verify that ALL specific details match EXACTLY as described in the requirements. FAILURE TO REJECT INCORRECT SUBMISSIONS HARMS THE INTEGRITY OF THE BOUNTY PROGRAM.

BOUNTY REQUIREMENTS: ${requirements}

CRITICAL: PARSE ALL ACTION VERBS AND CONDITIONS
First, carefully parse the requirements to identify ALL action verbs and conditions:
- "MUST be WEARING" = The person MUST physically have the item ON their body, visible in the video
- "MUST be USING" = The person MUST actively use/handle the item
- "AND" = BOTH conditions must be met simultaneously (if one fails, reject)
- "OR" = At least one condition must be met
- "TALK about" = Must verbally discuss/mention the item
- "SHOW" = Must visually display the item clearly
- "DEMONSTRATE" = Must actively use/show how the item works

CRITICAL: EXACT VISUAL VERIFICATION REQUIREMENT
You MUST verify that EVERY specific detail mentioned in the requirements appears EXACTLY as described. This includes:
- Specific product names, brands, or items (e.g., "clerk builder mode hat" means EXACTLY that hat, not a similar hat, not a different hat, not just any hat)
- Colors, designs, logos, or visual elements (must match EXACTLY)
- Text, slogans, or phrases that must appear (must match EXACTLY)
- Actions, demonstrations, or behaviors required (must be performed EXACTLY)
- Physical presence of items (if "wearing" is required, the EXACT item must be ON the person)
- Any other specific details mentioned

STRICT VALIDATION PROCESS - FOLLOW THIS EXACTLY:
1. **Parse Requirements**: Identify EVERY action verb, condition, and specific detail:
   - List all action verbs (wearing, using, talking, showing, demonstrating, etc.)
   - List all specific items/products mentioned (with exact names)
   - Identify all "AND" conditions (all must be met)
   - Identify all "OR" conditions (at least one must be met)

2. **Frame-by-Frame Visual Examination**: Carefully examine the ENTIRE video:
   - Pause and verify: Is the EXACT item mentioned in requirements visible?
   - For "wearing" requirements: Is the EXACT item physically ON the person's body?
   - For "using" requirements: Is the EXACT item being actively used/handled?
   - For "showing" requirements: Is the EXACT item clearly visible?
   - Verify colors, logos, branding match EXACTLY (not similar, EXACT)
   - Verify text/phrases appear EXACTLY as written
   - Count how long the EXACT item appears vs. similar items

3. **Action Verification**: For each action verb in requirements, verify it's performed:
   - "MUST be WEARING" = Check: Is the EXACT item on the person's head/body? (Not just mentioned, not just shown nearby, but PHYSICALLY ON THEM)
   - "MUST TALK about" = Check: Does the person verbally discuss the EXACT item?
   - "AND" conditions = Check: Are BOTH actions happening? (If only one, REJECT)

4. **Exact Match Verification**: For each specific detail, verify it appears EXACTLY:
   - If requirements say "clerk builder mode hat", verify the EXACT hat is shown (not a different hat, not a similar hat)
   - If requirements mention a specific color, brand, or design, verify it matches EXACTLY
   - Similar items are NOT acceptable - only exact matches
   - If you see a different item that looks similar, REJECT immediately

5. **Completeness Check**: Ensure ALL requirements are met simultaneously:
   - If requirements say "MUST be WEARING X AND TALK about X":
     * Check: Is X being worn? (If NO → REJECT)
     * Check: Is X being talked about? (If NO → REJECT)
     * Check: Is it the EXACT X mentioned? (If NO → REJECT)
     * ALL must be YES to approve

VALIDATION CRITERIA - The video must meet ALL of these:
- **100% Exact Visual Matching**: The EXACT item/product mentioned in requirements is visually present and matches EXACTLY (not similar, not approximate - EXACT)
- **100% Action Compliance**: ALL action verbs in requirements are performed EXACTLY as specified
- **100% Condition Compliance**: ALL "AND" conditions are met simultaneously
- **Primary Focus**: The bounty requirement must be a CORE element of the video, prominently featured throughout
- **Meaningful Engagement**: Required items/products are actively used, demonstrated, or prominently featured
- **Content Value**: The video provides genuine entertainment or educational value to viewers
- **Brand Alignment**: The content positively represents the brand and product

MANDATORY REJECTION CRITERIA - Reject if ANY of these apply:
- ANY specific detail from requirements is missing, incorrect, or replaced with something similar
- Product/item shown is similar but not the EXACT item mentioned in requirements
- Required colors, logos, text, or visual elements don't match EXACTLY
- Action verb not performed: If "MUST be WEARING" is required but the EXACT item is not on the person → REJECT
- Action verb not performed: If "MUST TALK about" is required but the person doesn't discuss it → REJECT
- "AND" condition failure: If requirements say "X AND Y" but only X or only Y is present → REJECT
- Person talks about the item but doesn't wear/use it when "MUST be WEARING/USING" is required → REJECT
- Person wears/uses a DIFFERENT item (even if similar) instead of the EXACT item required → REJECT
- Product shown for less than 10% of video duration without meaningful context
- Requirement mentioned only briefly without demonstration or explanation
- Video's main purpose is unrelated to the bounty requirement
- Product appears as background prop without active engagement
- Content feels forced or inauthentic
- Video lacks genuine value beyond showing the required item
- ANY doubt about exact matching → REJECT (when in doubt, reject)

SPECIFIC EXAMPLES - LEARN FROM THESE:

Example 1 - Requirement: "Create a video about the clerk builder mode hat, the person MUST be WEARING it AND TALK about it."
  - ✓ APPROVE: Person wears the EXACT "clerk builder mode hat" on their head AND talks about it
  - ✗ REJECT: Person talks about the clerk builder mode hat but wears a DIFFERENT hat → FAILS "MUST be WEARING" requirement
  - ✗ REJECT: Person wears the clerk builder mode hat but doesn't talk about it → FAILS "TALK about" requirement
  - ✗ REJECT: Person talks about it and wears a hat, but it's NOT the clerk builder mode hat → FAILS exact matching
  - ✗ REJECT: Person mentions it briefly but doesn't actually wear it → FAILS "MUST be WEARING"

Example 2 - Requirement: "wearing a clerk builder mode hat"
  - ✓ APPROVE: Video shows the EXACT "clerk builder mode hat" being worn
  - ✗ REJECT: Video shows a different hat, even if similar
  - ✗ REJECT: Video shows a hat but not the specific "clerk builder mode hat"
  - ✗ REJECT: Video mentions the hat but doesn't show it being worn

Example 3 - Requirement: "using Product X in blue color AND showing the logo"
  - ✓ APPROVE: Video shows Product X in blue AND logo is visible
  - ✗ REJECT: Video shows Product X but in a different color → FAILS color requirement
  - ✗ REJECT: Video shows Product X in blue but logo not visible → FAILS "showing logo" requirement
  - ✗ REJECT: Video shows a similar product in blue → FAILS exact product matching

Example 4 - Requirement: "displaying the brand logo prominently"
  - ✓ APPROVE: Video shows the exact brand logo clearly visible
  - ✗ REJECT: Video shows a similar logo or no logo
  - ✗ REJECT: Logo is present but not prominently displayed

VALIDATION RESPONSE RULES:
- Set valid=true ONLY if ALL criteria are met AND every specific detail matches EXACTLY AND all action verbs are performed AND all "AND" conditions are met
- Set valid=false if ANY detail doesn't match exactly, ANY action verb isn't performed, or ANY "AND" condition fails
- When rejecting, specify EXACTLY which requirement(s) failed:
  * Which specific detail doesn't match (and what was shown instead)
  * Which action verb wasn't performed
  * Which "AND" condition failed
- Provide clear, actionable feedback that helps creators understand what needs to be exact

Example feedback format for creators:
- "The video shows you talking about the clerk builder mode hat, but you are wearing a DIFFERENT hat. The requirements state you MUST be WEARING the clerk builder mode hat. You must wear the EXACT hat specified, not a different one."
- "The video shows a hat, but it's not the required 'clerk builder mode hat'. You must wear the EXACT hat specified in the requirements, not a similar hat."
- "The video shows Product X, but it's in red instead of the required blue color. The color must match EXACTLY."
- "The video needs to display the brand logo prominently as required. Currently, the logo is not visible or is different from what's specified."
- "The video shows a similar product, but the requirements specify Product X. You must use the EXACT product mentioned."
- "The requirements state you MUST be WEARING X AND TALK about X. You are only doing one of these. Both conditions must be met simultaneously."

REMEMBER THESE CRITICAL RULES:
1. Similar is NOT good enough. Only EXACT matches are acceptable.
2. If "MUST be WEARING" is required, the EXACT item must be physically ON the person, not just mentioned or shown nearby.
3. If "AND" is used, ALL conditions must be met. If even one fails, REJECT.
4. Talking about an item is NOT the same as wearing/using it. If both are required, both must happen.
5. When in doubt, REJECT. It's better to be too strict than to approve incorrect submissions.
6. Be thorough and examine the ENTIRE video, not just parts of it.
7. Verify visual elements frame-by-frame if necessary to ensure exact matching.
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
