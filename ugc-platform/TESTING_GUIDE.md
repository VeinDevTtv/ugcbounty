# Testing Guide for UGC Platform

## Quick Test Videos

### YouTube Videos (for testing YouTube submission flow)

1. **Popular Test Video (High Views)**
   - URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - This is a well-known video that should have view count data available

2. **YouTube Shorts**
   - URL: `https://www.youtube.com/shorts/jNQXAC9IVRw`
   - Good for testing shorts format

3. **Another Popular Video**
   - URL: `https://www.youtube.com/watch?v=9bZkp7q19f0`
   - High view count, reliable for testing

### TikTok Videos (for testing TikTok submission flow)

1. **Popular TikTok Video**
   - URL: `https://www.tiktok.com/@charlidamelio/video/1234567890` (replace with actual video ID)
   - Note: TikTok URLs change frequently, use any public TikTok video URL

2. **Alternative Format**
   - URL: `https://vm.tiktok.com/ZMxxxxx/` (shortened format)

### Instagram Videos

- URL: `https://www.instagram.com/p/xxxxx/` (replace with actual post ID)

## Step-by-Step Testing Guide

### 1. First, Create a Test Bounty

1. **Sign in** to your application using Clerk
2. **Click "Create Bounty"** in the header
3. **Fill in the form:**
   - Name: `Test Bounty - YouTube Videos`
   - Description: `Submit your best YouTube videos about technology and coding. Show us your setup, tutorials, or reviews.`
   - Total Bounty: `1000` (or any amount)
   - Rate per 1k Views: `10` (or any rate)
   - Company Name: `Test Company` (optional)
   - Logo: Upload a test image (optional)
4. **Click "Create Bounty"**
5. **You should be redirected** to the home page and see your new bounty

### 2. Test YouTube Submission Flow

1. **Click on your bounty** (or any bounty) to view details
2. **Click "Submit for this Bounty"** button
3. **In the dialog, paste a YouTube URL:**
   ```
   https://www.youtube.com/watch?v=dQw4w9WgXcQ
   ```
4. **Click "Submit"**
5. **What should happen:**
   - The system detects it's a YouTube URL
   - It validates the video (calls `/api/validate-bounty`)
   - It fetches view count from YouTube API
   - It creates a submission with status "approved"
   - The submission appears on the bounty detail page
   - Progress bar updates based on view count

### 3. Test TikTok Submission Flow

1. **Open the claim dialog** again
2. **Paste a TikTok URL:**
   ```
   https://www.tiktok.com/@username/video/1234567890
   ```
   (Use a real TikTok video URL)
3. **Click "Submit"**
4. **What should happen:**
   - The system detects it's a TikTok URL
   - It fetches data from TikTok API (Peekalink)
   - It creates a submission directly (no validation step)
   - The submission appears with TikTok metadata

### 4. Test Progress Calculation

1. **Submit multiple videos** to the same bounty
2. **Check the bounty detail page:**
   - Progress bar should show percentage
   - "Claimed" amount should be calculated: `(totalViews / 1000) * ratePer1kViews`
   - Progress percentage: `(usedBounty / totalBounty) * 100`
3. **Submit enough views to exceed total bounty:**
   - Progress should cap at 100%
   - Bounty should show as "completed"

### 5. Test Profile Page

1. **Navigate to `/profile`**
2. **You should see:**
   - Your created bounties
   - Your submissions
   - Stats (total earnings, views, etc.)
3. **Test editing a bounty:**
   - Click "Edit" on one of your bounties
   - Change name or description
   - Click "Save"
   - Changes should persist

### 6. Test Owner Detection

1. **Create a bounty** while logged in
2. **On the home page:**
   - Your bounty should show "Your Bounty" instead of "Submit" button
3. **Log out and log in as a different user:**
   - The bounty should show "Submit for this Bounty" button
   - You should be able to submit to it

### 7. Test Submission Display

1. **View a bounty with submissions**
2. **Check that submissions show:**
   - Thumbnail image (if available)
   - Title (or video URL if no title)
   - View count
   - Earned amount
   - User who submitted
   - Status badge
   - Validation explanation (if any)

## Expected API Responses

### GET /api/bounties
Should return bounties with:
- `calculated_claimed_bounty` (calculated from submissions)
- `progress_percentage` (0-100)
- `total_submission_views` (sum of approved submission views)
- `is_completed` (boolean)

### POST /api/submit-bounty-item
Should return:
```json
{
  "success": true,
  "submission": {
    "id": "uuid",
    "bounty_id": "uuid",
    "video_url": "...",
    "view_count": 123456,
    "title": "Video Title",
    "cover_image_url": "...",
    "author": "...",
    "platform": "youtube",
    "status": "approved"
  }
}
```

## Common Issues to Check

1. **UUID Handling:**
   - All IDs should be UUID strings, not numbers
   - No `parseInt` calls on IDs
   - Links should use UUID strings

2. **Progress Calculation:**
   - Should only count approved submissions
   - Formula: `(totalViews / 1000) * ratePer1kViews`
   - Should cap at total bounty amount

3. **Metadata Fields:**
   - Submissions should have `title`, `cover_image_url`, `author`, `platform`
   - These should display on bounty detail page

4. **Validation Flow:**
   - YouTube: validates first, then submits
   - TikTok/Instagram: submits directly

## Database Migration

**IMPORTANT:** Before testing, make sure to run the migration:

```bash
# If using Supabase CLI
supabase migration up

# Or apply manually in Supabase dashboard
# Run the SQL from: supabase/migrations/005_add_submission_metadata.sql
```

This adds the metadata fields (`title`, `description`, `cover_image_url`, `author`, `platform`) to the submissions table.

## Environment Variables Needed

Make sure these are set in your `.env.local`:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# APIs (for fetching video data)
YOUTUBE_API_KEY=...  # Required for YouTube view counts
PEEKALINK_API_KEY=...  # Optional, for TikTok data
LINKPREVIEW_API_KEY=...  # Required for link previews
```

## Quick Test Checklist

- [ ] Can create a bounty
- [ ] Can submit YouTube video
- [ ] Can submit TikTok video (if API key configured)
- [ ] Progress bar updates correctly
- [ ] Submissions show with metadata (thumbnail, title)
- [ ] Owner detection works (shows "Your Bounty")
- [ ] Profile page shows bounties and submissions
- [ ] Can edit bounty name/description
- [ ] All links use UUID strings (not numbers)
- [ ] No errors in browser console
- [ ] No errors in server logs

