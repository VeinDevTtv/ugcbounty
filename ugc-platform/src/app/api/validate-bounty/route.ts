import { NextRequest, NextResponse } from 'next/server'
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
      description: 'Whether the video meets all the specified bounty requirements'
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
      model: 'gemini-3.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: validationSchema
      }
    })

    const prompt = `
You are a content moderator reviewing a YouTube video submission for a UGC bounty program. Your job is to ensure high-quality UGC content that truly serves the brand's marketing goals.

BOUNTY REQUIREMENTS: ${requirements}

CRITICAL ANALYSIS FRAMEWORK:
1. **Core Purpose Analysis**: What is the main purpose/focus of this video? Is the bounty requirement the central theme or just a brief mention?
2. **Content Quality Assessment**: Does this video provide genuine value to viewers while meeting the brand requirements?
3. **Requirement Fulfillment**: Does the video actually fulfill the specific requirements, not just show them briefly?

VALIDATION CRITERIA - The video must meet ALL of these:
- **Primary Focus**: The bounty requirement must be a CORE element of the video, not just a brief appearance
- **Meaningful Engagement**: The product/requirement should be actively used, demonstrated, or prominently featured
- **Content Value**: The video should provide genuine entertainment or educational value to viewers
- **Brand Alignment**: The content should positively represent the brand and product

REJECTION CRITERIA - Reject if any of these apply:
- Product shown for less than 10% of video duration without meaningful context
- Requirement mentioned only briefly without demonstration or explanation
- Video's main purpose is unrelated to the bounty requirement
- Product appears as background prop without active engagement
- Content feels forced or inauthentic
- Video lacks genuine value beyond showing the required item

For the validation response:
- If the video meets ALL criteria: Set valid=true and explain what the video did correctly
- If the video does NOT meet criteria: Set valid=false and provide specific, actionable feedback

Example feedback format for creators:
- "The video needs to make the [product] the main focus, not just show it briefly in the background"
- "Your video should actively demonstrate or use the [product] throughout the content"
- "The [requirement] should be central to your video's story, not just mentioned in passing"
- "Focus your entire video around showcasing the [product] features and benefits"

Provide direct, actionable feedback that helps creators understand how to create better UGC content.
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
