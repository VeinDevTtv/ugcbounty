# TEAM MEMBER 2: Frontend Pages & Data Integration

**Priority:** CRITICAL - Start after API routes ready

---

## Tasks

### Home Page

1. **Replace hardcoded bounties with API fetch**
   - Remove hardcoded `BOUNTIES` array
   - Fetch from `/api/bounties` or use `getBountiesAction()` server action
   - Map API response fields (snake_case → camelCase)

2. **Match reference implementation structure**
   - Use Client Component with `useState` and `useEffect`
   - Implement data fetching on component mount
   - Handle API response mapping to frontend format

3. **Add loading states**
   - Show centered spinner while fetching
   - Display loading before rendering any content

4. **Display bounties in grid with BountyCard**
   - Responsive grid: 1 col mobile, 2 cols tablet, 3 cols desktop
   - Use existing `BountyCard` component or update to match data structure
   - Pass `isOwner` prop based on `creator_id` comparison

5. **Handle empty state**
   - Show message when no bounties available
   - Center the empty state message

6. **Connect ClaimBountyDialog**
   - Handle dialog open/close state
   - Pass selected bounty data to dialog
   - Pass `isCompleted` prop to prevent submissions for completed bounties

---

### Bounty Detail Page /bounty/[id]

1. **Rewrite to match reference structure**
   - Create `src/app/bounty/[id]/page.tsx`
   - Use `use()` hook for params (Next.js 15+)
   - Implement Client Component with proper state management

2. **Fetch bounty details from API**
   - Fetch from `/api/bounties` and filter by ID
   - Map database fields to frontend format
   - Handle 404 case (bounty not found)

3. **Fetch submissions for bounty**
   - Fetch from `/api/bounties/[id]/submissions`
   - Display all submissions with full details:
     - Status badge (pending/approved/rejected)
     - Video URL, view count, earned amount
     - Creator info, submission date
     - Validation explanation (if present)
     - Cover image (if available)

4. **Calculate progress from submissions**
   - Calculate from approved submissions only:
     - Sum `view_count` from approved submissions
     - Formula: `usedBounty = (totalViews / 1000) * ratePer1kViews`
     - Cap at total: `cappedUsedBounty = Math.min(usedBounty, totalBounty)`
     - Percentage: `progressPercentage = Math.min((usedBounty / totalBounty) * 100, 100)`
     - Completed if: `usedBounty >= totalBounty`
   - Display in progress bar

5. **Display submissions list**
   - Vertical list with all submission details
   - Empty state: "No submissions yet. Be the first to submit!"
   - Show thumbnail, status, creator, views, earnings

6. **Show owner vs non-owner states**
   - **Owner**: "This is your bounty. Creators will submit their content here."
   - **Non-owner**: 
     - If completed: "This bounty has been completed"
     - If not: Show submission button
   - Detect by comparing `creator_id` with Clerk user ID

7. **Connect submission button**
   - Opens `ClaimBountyDialog`
   - Pass bounty data and `isCompleted` flag
   - Handle dialog state

---

### Profile Page /profile

1. **Create /app/profile/page.tsx matching reference**
   - Client Component with Clerk authentication
   - Redirect to home if not logged in
   - Use `useUser()` from Clerk

2. **Tabs: "My Bounties" and "My Submissions"**
   - State-managed tab switching
   - Display counts: "My Bounties (3)", "My Submissions (5)"
   - Active tab styling: black border-bottom

3. **Fetch user's bounties (creator_id filter)**
   - Use `/api/bounties` and filter by `creator_id === user.id`
   - OR use `getBountiesAction({ creator_id: user.id })`
   - Display in vertical list (not grid)
   - Each shows: name, description, stats, edit button, link to detail

4. **Fetch user's submissions**
   - Fetch from `/api/submissions` or use `getSubmissionsAction({ user_id: user.id })`
   - Display in vertical list with:
     - Bounty name (link)
     - Video URL (clickable)
     - Status badge
     - Views, rate, earned, potential earnings
     - Submission date
     - Validation explanation

5. **Edit bounty functionality (name/description)**
   - Click "Edit Details" → enter edit mode
   - Input for name, textarea for description
   - PUT to `/api/bounties` with `{ id, name, description }`
   - Update local state after save
   - Show loading while saving

6. **Display earnings/stats**
   - In submissions tab: total earnings, total views
   - Count of approved/pending/rejected submissions
   - Optional: stats section at top of profile

---

### Data Types

1. **Add type definitions matching reference**
   - Create `src/app/data/bounties.ts`
   - Define interfaces:
     - `Bounty` - Frontend bounty format
     - `Submission` - Submission data structure
     - `BountyWithCreator` - API response format
   - Import and use throughout components

2. **Match all interfaces from reference**
   - Ensure type definitions match the data structures used
   - Include optional fields where appropriate
   - Use proper TypeScript types (string, number, boolean, etc.)

---

## API Endpoints

- `GET /api/bounties` - All bounties with calculated progress
- `GET /api/bounties/[id]/submissions` - Submissions for a bounty
- `GET /api/submissions` - Current user's submissions
- `PUT /api/bounties` - Update bounty (name/description)
- `POST /api/submit-bounty-item` - Submit content

**Or use Server Actions:**
- `getBountiesAction({ creator_id?: string })`
- `getSubmissionsAction({ user_id?: string, bounty_id?: string })`

---

## Key Points

- Map API responses: snake_case → camelCase
- Calculate progress from approved submissions only
- Detect ownership via `creator_id` comparison
- Always show loading states
- Handle empty states gracefully
- Use TypeScript types consistently
- Ensure responsive design

