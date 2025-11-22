# TEAM MEMBER 2: Frontend Pages & Data Integration

**Priority:** CRITICAL - Start after API routes ready

---

## Tasks

### Home Page

1. **Add Header component to page**
   - Import Header component (currently in layout, needs to be in page like og/)
   - Remove Header from layout.tsx
   - Match og/ structure: Header at top, then grid

2. **Update BountyCard usage to match og/ props**
   - Change from `data={bountyCardData}` to `bounty={bounty}`, `onClaim={handleClaimBounty}`, `isOwner={isOwner}`
   - Update BountyCard component to accept these props (see BountyCard tasks)

3. **Fix grid styling to match og/**
   - Add seamless borders: `md:[&:not(:nth-child(2n+1))]:ml-[-1px]`
   - Match og/ grid structure exactly

4. **Connect ClaimBountyDialog**
   - Add state for selected bounty
   - Implement `handleClaimBounty` function
   - Pass bounty data and `isCompleted` flag to dialog
   - Handle dialog open/close state

5. **Ensure UUID handling**
   - Verify all IDs are strings (UUIDs), not numbers
   - Update any number ID references to string

---

### Bounty Detail Page /bounty/[id]

1. **Move page from /[id] to /bounty/[id]**
   - Create `src/app/bounty/[id]/page.tsx`
   - Copy structure from `og/app/bounty/[id]/page.tsx`
   - Delete old `src/app/[id]/page.tsx`
   - Use `use()` hook for params (Next.js 15+)

2. **Update to use UUID format**
   - Change all `id: number` to `id: string` (UUID)
   - Remove `parseInt(id)` - use string directly
   - Update all type definitions

3. **Match og/ styling exactly**
   - Border: `border-gray-300`
   - Background: `bg-[#F5F1E8]`
   - Match all section layouts and spacing

4. **Verify progress calculation**
   - Ensure it calculates from submissions (already implemented)
   - Display matches og/ format

5. **Update ClaimBountyDialog integration**
   - Use correct props format
   - Pass bounty with correct type (Bounty from data/bounties.ts)

---

### Profile Page /profile

1. **Create /app/profile/page.tsx matching reference**
   - Copy from `og/app/profile/page.tsx`
   - Update to use UUID format (id: string, not number)
   - Client Component with Clerk authentication
   - Redirect to home if not logged in

2. **Update API calls**
   - Change `/api/submissions` to `/api/user-submissions` (needs to be created)
   - Ensure UUID handling in all API calls

3. **Update type definitions**
   - Change all `id: number` to `id: string`
   - Update Bounty and Submission interfaces

4. **Match og/ styling exactly**
   - Border: `border-black`
   - Background: `bg-[#F5F1E8]`
   - Tab styling: black border-bottom when active

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

- `GET /api/bounties` - All bounties with calculated progress ✅ EXISTS
- `GET /api/bounties/[id]/submissions` - Submissions for a bounty ✅ EXISTS
- `GET /api/user-submissions` - Current user's submissions ❌ NEEDS CREATION
- `PUT /api/bounties` - Update bounty (name/description) ❌ NEEDS CREATION
- `POST /api/submit-bounty-item` - Submit content ✅ EXISTS (needs link-preview, youtube-views, tiktok-views)

**Note:** `/api/user-submissions` needs to be created. Currently profile page tries to use `/api/submissions` which doesn't exist.

---

## Key Points

- Map API responses: snake_case → camelCase
- Calculate progress from approved submissions only
- Detect ownership via `creator_id` comparison
- Always show loading states
- Handle empty states gracefully
- Use TypeScript types consistently
- Ensure responsive design

