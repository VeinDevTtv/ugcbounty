# Frontend Pages & Data Integration - Implementation Guide

**Priority:** CRITICAL - Start after API routes are ready

---

## Overview

This guide describes the frontend pages and data integration work needed to complete the UGC Bounty Platform. The work involves replacing hardcoded data with API calls, implementing proper data fetching, loading states, and creating new pages.

---

## Task 1: Home Page (/) - 3 hours

### Current State
- The home page (`src/app/page.tsx`) currently displays hardcoded bounty data
- Uses a different data structure than what the API provides
- Missing loading states and proper error handling

### Requirements

1. **Replace Hardcoded Data with API Fetching**
   - Remove the hardcoded `BOUNTIES` array
   - Fetch bounties from `/api/bounties` endpoint (or use server actions from `src/app/actions/bounties.ts`)
   - The API returns bounties with snake_case fields that need to be mapped to camelCase for the frontend

2. **Data Mapping**
   - Map API response fields to frontend format:
     - `total_bounty` → `totalBounty`
     - `rate_per_1k_views` → `ratePer1kViews`
     - `claimed_bounty` → `claimedBounty` (use `calculated_claimed_bounty` from API)
     - `logo_url` → `logoUrl`
     - `company_name` → `companyName`
     - `progress_percentage` → `progressPercentage`
     - `total_submission_views` → `totalSubmissionViews`
     - `is_completed` → `isCompleted`
     - Keep `creator_id` to check ownership

3. **Loading States**
   - Show a loading spinner while fetching bounties
   - Use a centered spinner with appropriate styling
   - Display loading state before any bounties are rendered

4. **Empty State**
   - Display a message when no bounties are available
   - Show a user-friendly message like "No bounties available yet. Create one to get started!"
   - Center the empty state message

5. **Display Bounties in Grid**
   - Display bounties in a responsive grid:
     - 1 column on mobile
     - 2 columns on medium screens (md:grid-cols-2)
     - 3 columns on large screens (lg:grid-cols-3)
   - Use the existing `BountyCard` component or update it to match the data structure
   - Ensure grid items have proper spacing and hover effects

6. **Owner Detection**
   - Compare `creator_id` from API response with current user's ID (from Clerk)
   - Pass `isOwner` boolean prop to `BountyCard` component
   - Cards should show "Your Bounty" for owned bounties

7. **Connect ClaimBountyDialog**
   - When "Submit for this Bounty" button is clicked, open the ClaimBountyDialog
   - Pass the selected bounty data to the dialog
   - Handle dialog open/close state
   - Pass `isCompleted` prop to prevent submissions for completed bounties

8. **Link to Bounty Details**
   - Each bounty card should link to `/bounty/[id]` route
   - Use Next.js `Link` component for navigation
   - Ensure links work properly with the grid layout

### Expected Behavior
- Page loads with a spinner, then displays bounties in a grid
- Each bounty card shows progress, rate, and description
- Clicking a card navigates to the bounty detail page
- Clicking "Submit for this Bounty" opens the claim dialog
- Owner bounties show "Your Bounty" instead of submit button

---

## Task 2: Bounty Detail Page (/bounty/[id]) - 4 hours

### Current State
- The page exists at `src/app/[id]/page.tsx` with hardcoded content
- Needs to be moved to `src/app/bounty/[id]/page.tsx` to match route structure
- Currently shows static data with no real API integration

### Requirements

1. **Restructure Route**
   - Create new directory: `src/app/bounty/[id]/`
   - Move or create `page.tsx` in the new location
   - Ensure route parameter is properly handled (use `use()` hook from React for Next.js 15+)

2. **Fetch Bounty Details**
   - Fetch bounty data from `/api/bounties` endpoint
   - Filter by ID to get the specific bounty
   - Handle case where bounty doesn't exist (404 state)
   - Map database fields to frontend format (same mapping as home page)

3. **Fetch Submissions for Bounty**
   - Fetch submissions from `/api/bounties/[id]/submissions` endpoint
   - Display all submissions for this bounty
   - Each submission should show:
     - Status badge (pending/approved/rejected)
     - Video URL as clickable link
     - View count
     - Earned amount
     - Submission date
     - Creator username/email (from user_profiles)
     - Validation explanation (if present)
     - Cover image/thumbnail (if available)

4. **Calculate Progress from Submissions**
   - Calculate progress based on approved submissions only:
     - Sum all `view_count` from approved submissions
     - Calculate: `usedBounty = (totalViews / 1000) * ratePer1kViews`
     - Cap at total bounty: `cappedUsedBounty = Math.min(usedBounty, totalBounty)`
     - Calculate percentage: `progressPercentage = Math.min((usedBounty / totalBounty) * 100, 100)`
     - Mark as completed if `usedBounty >= totalBounty`
   - Display progress bar with these calculations
   - Show remaining bounty amount

5. **Display Submissions List**
   - Show submissions in a vertical list
   - Each submission item should display:
     - Thumbnail (if `cover_image_url` exists)
     - Status badge with color coding (approved=green, rejected=red, pending=yellow)
     - Video title or URL
     - Creator information
     - View count and earned amount
     - Validation note (if present)
   - Handle empty state: "No submissions yet. Be the first to submit!"

6. **Owner vs Non-Owner States**
   - **Owner State**: 
     - Show message: "This is your bounty. Creators will submit their content here."
     - Do not show submission button
   - **Non-Owner State**:
     - If completed: Show "This bounty has been completed" message
     - If not completed: Show "Submit your content to participate in this bounty" button
   - Detect ownership by comparing `creator_id` with current user ID

7. **Connect Submission Button**
   - Button opens `ClaimBountyDialog` component
   - Pass bounty data to dialog
   - Pass `isCompleted` flag to prevent submissions
   - Handle dialog state (open/close)

8. **Page Sections**
   - **Hero Section**: Total bounty amount, company logo/name, bounty name and description
   - **Earning Rate Section**: Display rate per 1k views and potential earnings calculator (10k, 50k, 100k views)
   - **Progress Section**: Progress bar, claimed amount, remaining amount, total views from submissions
   - **Requirements Section**: List of requirements with checkmarks
   - **How It Works Section**: Numbered steps explaining the process
   - **Submissions Section**: List of all submissions with details

### Expected Behavior
- Page loads with loading spinner
- Displays full bounty details with calculated progress
- Shows submissions list with status and earnings
- Owner sees ownership message, non-owners see submit button (if not completed)
- All calculations are based on real submission data from the database

---

## Task 3: Profile Page (/profile) - 3 hours

### Current State
- Profile page may not exist yet or may be at `/dashboard`
- Need to create `src/app/profile/page.tsx`

### Requirements

1. **Create Profile Page**
   - Create new file: `src/app/profile/page.tsx`
   - Use Client Component ("use client")
   - Add authentication check - redirect to home if not logged in
   - Use Clerk's `useUser()` hook to get current user

2. **Implement Tabs**
   - Two tabs: "My Bounties" and "My Submissions"
   - Use state to manage active tab
   - Display count for each tab: "My Bounties (3)" and "My Submissions (5)"
   - Tab styling: active tab has black border-bottom, inactive is gray
   - Smooth transitions between tabs

3. **My Bounties Tab**
   - Fetch user's bounties by filtering with `creator_id` equal to current user's ID
   - Use `/api/bounties` endpoint and filter client-side, OR
   - Use server action with `creator_id` filter: `getBountiesAction({ creator_id: user.id })`
   - Display bounties in a vertical list (not grid)
   - Each bounty card shows:
     - Bounty name and description
     - Total bounty, rate per 1k views, claimed bounty, remaining
     - Edit button (only for owned bounties)
     - Link to bounty detail page
   - Empty state: "You haven't created any bounties yet." with link to create one

4. **Edit Bounty Functionality**
   - Click "Edit Details" button to enter edit mode
   - Edit mode shows:
     - Input field for bounty name
     - Textarea for description
     - Save and Cancel buttons
   - Save updates via PUT request to `/api/bounties` with:
     ```json
     {
       "id": bountyId,
       "name": newName,
       "description": newDescription
     }
     ```
   - Update local state after successful save
   - Show loading state while saving

5. **My Submissions Tab**
   - Fetch user's submissions from `/api/submissions` endpoint
   - Filter by current user's ID (or use server action with `user_id` filter)
   - Display submissions in a vertical list
   - Each submission shows:
     - Bounty name (linked to bounty detail page)
     - Video URL (clickable, opens in new tab)
     - Status badge (pending/approved/rejected) with color coding
     - Views count
     - Rate per 1k views (from related bounty)
     - Earned amount
     - Potential earnings (calculated: `(view_count / 1000) * rate_per_1k_views`)
     - Submission date
     - Validation explanation (if present)
   - Empty state: "You haven't submitted to any bounties yet." with link to browse bounties

6. **Display Earnings/Stats**
   - In My Submissions tab, show summary statistics:
     - Total earnings across all approved submissions
     - Total views across all submissions
     - Count of approved/pending/rejected submissions
   - Optional: Add a stats section at the top of the profile page

7. **Loading States**
   - Show loading spinner while fetching data
   - Handle both tabs with appropriate loading states
   - Disable buttons during save operations

### Expected Behavior
- Page requires authentication (redirects if not logged in)
- Two tabs switch between user's bounties and submissions
- Bounties can be edited inline
- Submissions show full details with earnings
- All data is fetched from API, no hardcoded values

---

## Task 4: Data Types - 1 hour

### Requirements

1. **Create Type Definitions File**
   - Create file: `src/app/data/bounties.ts` (or similar location)
   - Define all TypeScript interfaces used across the application

2. **Bounty Interface**
   ```typescript
   export interface Bounty {
     id: number;
     name: string;
     totalBounty: number;
     ratePer1kViews: number;
     description: string;
     claimedBounty: number; // Calculated from submissions
     logoUrl?: string;
     companyName?: string;
     progressPercentage?: number; // Calculated progress
     totalSubmissionViews?: number; // Total views from approved submissions
     isCompleted?: boolean; // Whether bounty is completed
     submittedBy?: {
       userId: string;
       username?: string;
       email?: string;
     };
     createdAt?: string;
   }
   ```

3. **Submission Interface**
   ```typescript
   export interface Submission {
     id: number;
     bounty_id: number;
     user_id: string;
     video_url: string;
     view_count: number;
     earned_amount: number;
     status: 'pending' | 'approved' | 'rejected';
     validation_explanation: string | null;
     title: string | null;
     description: string | null;
     cover_image_url: string | null;
     author: string | null;
     platform: 'youtube' | 'tiktok' | 'instagram' | 'other' | null;
     created_at: string;
     updated_at: string;
     user_profiles?: {
       username: string | null;
       email: string | null;
     } | null;
     bounties?: {
       id: number;
       name: string;
       rate_per_1k_views: number;
     };
   }
   ```

4. **BountyWithCreator Interface (for API responses)**
   ```typescript
   export interface BountyWithCreator {
     id: number;
     name: string;
     description: string;
     total_bounty: number;
     rate_per_1k_views: number;
     claimed_bounty: number;
     creator_id: string | null;
     logo_url?: string | null;
     company_name?: string | null;
     calculated_claimed_bounty: number;
     progress_percentage: number;
     total_submission_views: number;
     is_completed: boolean;
   }
   ```

5. **Import and Use Types**
   - Import these types in all relevant components
   - Use them for state variables, function parameters, and API responses
   - This ensures type safety across the application

### Expected Behavior
- All components use consistent type definitions
- TypeScript catches type errors during development
- API responses are properly typed
- Easy to maintain and refactor

---

## API Endpoints Reference

The following API endpoints should be available (verify with team):

- `GET /api/bounties` - Fetch all bounties with calculated progress
- `GET /api/bounties/[id]/submissions` - Fetch submissions for a specific bounty
- `GET /api/submissions` - Fetch current user's submissions (requires auth)
- `PUT /api/bounties` - Update bounty (name/description)
- `POST /api/submit-bounty-item` - Submit content to a bounty
- Server Actions (alternative to API routes):
  - `getBountiesAction({ creator_id?: string })` - From `src/app/actions/bounties.ts`
  - `getSubmissionsAction({ user_id?: string, bounty_id?: string })` - From `src/app/actions/submissions.ts`

---

## Key Implementation Notes

1. **Data Mapping**: Always map snake_case API responses to camelCase for frontend
2. **Progress Calculation**: Progress is calculated from approved submissions' view counts, not stored values
3. **Ownership Detection**: Use `creator_id` from API response compared with Clerk user ID
4. **Loading States**: Always show loading indicators while fetching data
5. **Error Handling**: Handle API errors gracefully with user-friendly messages
6. **Authentication**: Use Clerk's `useUser()` hook and protect routes that require login
7. **Type Safety**: Use TypeScript interfaces for all data structures
8. **Responsive Design**: Ensure all pages work on mobile, tablet, and desktop

---

## Testing Checklist

- [ ] Home page fetches and displays bounties from API
- [ ] Loading states work correctly
- [ ] Empty states display appropriately
- [ ] Bounty cards link to detail pages
- [ ] Owner detection works (shows "Your Bounty")
- [ ] Claim dialog opens and submits correctly
- [ ] Bounty detail page fetches and displays correct data
- [ ] Progress calculates correctly from submissions
- [ ] Submissions list displays all data
- [ ] Owner vs non-owner states display correctly
- [ ] Submission button opens dialog for non-owners
- [ ] Profile page requires authentication
- [ ] Tabs switch correctly between bounties and submissions
- [ ] Edit bounty functionality works
- [ ] User's submissions display with all details
- [ ] All TypeScript types are properly defined and used
- [ ] No console errors
- [ ] Responsive design works on all screen sizes

---

## Estimated Time

- **Home Page**: 3 hours
- **Bounty Detail Page**: 4 hours
- **Profile Page**: 3 hours
- **Data Types**: 1 hour
- **Total**: 11 hours

