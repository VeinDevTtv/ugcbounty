# TEAM MEMBER 3: Components & UI/UX

**Priority:** HIGH - Can start in parallel

---

## Tasks

### Header Component

1. **Update existing Header.tsx to match og/ styling**
   - Currently uses zinc colors and different structure
   - Change to match og/ exactly:
     - Border: `border-b border-gray-300`
     - Background: `bg-[#F5F1E8]` (inherited from body)
     - Logo title: `font-[family-name:var(--font-dancing-script)]`
     - Button styling: `border-l border-r border-gray-300 hover:border-b-4 hover:border-b-black`
     - Remove zinc/emerald colors, use black/gray

2. **Update create bounty modal styling**
   - Background: `bg-[#F5F1E8]` (not white)
   - Border: `border border-black` (not zinc-200)
   - Input styling: `border border-black bg-white` (not zinc-300)
   - Remove rounded corners, match og/ square borders

3. **Update Header layout structure**
   - Left: Logo/title with Dancing Script font, tagline
   - Right: Navigation buttons with border styling
   - Add "My Profile" link for authenticated users
   - Match og/ button layout exactly

4. **Remove Header from layout.tsx**
   - Header should be in page.tsx (like og/)
   - Remove from layout, add to home page

---

### BountyCard Component

1. **Rewrite to match og/ structure exactly**
   - Current component uses different props (`data` object)
   - Change to: `bounty: Bounty`, `onClaim: (e) => void`, `isOwner?: boolean`
   - Copy structure from `og/app/components/BountyCard.tsx`

2. **Update props interface**
   - Use Bounty type from `src/app/data/bounties.ts` (needs to be created)
   - Remove current `BountyProps` interface
   - Match og/ props exactly

3. **Match og/ styling exactly**
   - Border: `border border-gray-300`
   - Hover: `hover:border-black` with z-index
   - Progress bar: `border border-black h-3`
   - Completed: `bg-green-500` (not black)
   - Remove all zinc/indigo colors

4. **Update card content structure**
   - Company logo/name at top (if available)
   - Bounty name as heading
   - Total bounty & rate display
   - Progress bar section with claimed/remaining
   - Description (line-clamp-2)
   - Action button at bottom
   - Fixed height: `h-[400px]` with flex layout

---

### ClaimBountyDialog Component

1. **Complete existing ClaimBountyDialog.tsx**
   - Currently has basic structure but incomplete
   - Copy full implementation from `og/app/components/ClaimBountyDialog.tsx`
   - Update props to match: `bounty: Bounty`, `isOpen: boolean`, `onClose: () => void`, `isCompleted?: boolean`

2. **Implement link preview fetching**
   - Currently missing link preview functionality
   - Fetch from `/api/link-preview` (needs to be created)
   - Display preview with image, title, description
   - Debounce API calls (1 second after typing stops)

3. **Update styling to match og/**
   - Background: `bg-[#F5F1E8]` (not slate colors)
   - Border: `border border-black`
   - Input styling: `border border-black` (not slate)
   - Remove dark mode classes, use light theme only

4. **Fix submission flow**
   - Currently has placeholder TODO
   - Connect to `/api/submit-bounty-item` properly
   - Handle YouTube validation (if `/api/validate-bounty` exists)
   - For other platforms: submit directly
   - Show proper success/error states

5. **Update type imports**
   - Use Bounty type from `src/app/data/bounties.ts`
   - Remove placeholder types

---

### Styling & Layout

1. **Match globals.css styling**
   - Update CSS variables:
     - `--background: #F5F1E8`
     - `--foreground: #000000`
   - Set body background to `#F5F1E8`
   - Keep font-family as Arial, Helvetica, sans-serif
   - Add line-clamp utilities if not present

2. **Update layout.tsx to match reference**
   - Background color: `bg-[#F5F1E8]`
   - Add Dancing Script font (optional, for title)
   - Remove container/max-width constraints that don't match reference
   - Ensure layout structure matches reference

3. **Remove unnecessary components**
   - Identify unused UI components
   - Remove or archive components not being used
   - Clean up unused imports and dependencies
   - Keep only what's needed for the application

4. **Ensure consistent styling across pages**
   - All pages use `#F5F1E8` background
   - Consistent border colors: `border-gray-300` or `border-black`
   - Consistent text colors: black primary, gray-700 secondary
   - Consistent spacing and padding
   - Consistent button and link styling
   - Match reference design system

---

### Polish & Bug Fixes

1. **Test all flows**
   - Test bounty creation flow end-to-end
   - Test logo upload flow
   - Test bounty submission flow
   - Test navigation between pages
   - Test authentication states (logged in/out)
   - Test owner vs non-owner states
   - Test completed bounty states

2. **Fix any styling inconsistencies**
   - Check all pages for consistent styling
   - Ensure colors match design system
   - Fix spacing inconsistencies
   - Fix border styling inconsistencies
   - Ensure hover states work everywhere
   - Fix responsive design issues

3. **Add error messages**
   - Form validation error messages
   - API error messages in user-friendly format
   - Network error handling
   - Loading state messages
   - Success confirmations where appropriate

4. **Improve loading states**
   - Add spinners where needed
   - Disable buttons during operations
   - Show progress indicators
   - Prevent multiple submissions
   - Clear feedback during async operations

---

## API Endpoints Status

- `POST /api/bounties` - Create new bounty ✅ EXISTS
- `POST /api/upload-logo` - Upload logo file ✅ EXISTS
- `POST /api/link-preview` - Get link preview data ❌ NEEDS CREATION (required for ClaimBountyDialog)
- `POST /api/validate-bounty` - Validate YouTube video ❌ MAY NOT EXIST (check if needed)
- `POST /api/submit-bounty-item` - Submit content to bounty ✅ EXISTS (but needs link-preview, youtube-views, tiktok-views)

**Note:** `/api/link-preview` is critical for ClaimBountyDialog to work. Coordinate with Team Member 1 to create it.

---

## Key Styling Guidelines

- **Colors:**
  - Background: `#F5F1E8`
  - Text: Black (`#000000`) primary, Gray-700 secondary
  - Borders: `border-gray-300` or `border-black`
  - Progress bar: Black when active, Green when completed

- **Typography:**
  - Font: Arial, Helvetica, sans-serif
  - Headings: Bold, various sizes
  - Body: Regular weight

- **Spacing:**
  - Consistent padding: `p-4`, `p-6`, `p-8`
  - Consistent margins: `mb-4`, `mb-6`, `mb-8`
  - Border spacing: `border-b border-gray-300`

- **Interactions:**
  - Hover effects: `hover:border-b-4 hover:border-b-black`
  - Transitions: `transition-colors duration-200`
  - Buttons: Black background with white text, or transparent with black border

---

## Component Structure

### Header Component Structure
```
Header
├── Logo/Title Section (Link to home)
├── Navigation Buttons
│   ├── Create Bounty Button
│   ├── My Profile Link (if authenticated)
│   ├── Sign Up / Login (if not authenticated)
│   └── UserButton (if authenticated)
└── Create Bounty Modal
    ├── Form Fields
    ├── Logo Upload
    └── Submit Button
```

### BountyCard Component Structure
```
BountyCard
├── Company Logo/Name (if available)
├── Bounty Name
├── Total Bounty & Rate
├── Progress Bar Section
├── Description
└── Action Button (Submit/Your Bounty/Completed)
```

### ClaimBountyDialog Component Structure
```
ClaimBountyDialog
├── Modal Overlay
├── Modal Container
│   ├── Header (Title + Close Button)
│   ├── Bounty Info
│   ├── URL Input
│   ├── Link Preview (if available)
│   ├── Validation Status
│   └── Submit Button
```

---

## Testing Checklist

- [ ] Header renders correctly with all buttons/links
- [ ] Create Bounty button opens modal when authenticated
- [ ] Modal form validates all required fields
- [ ] Logo upload works and shows preview
- [ ] Logo upload handles errors gracefully
- [ ] Bounty creation submits to API correctly
- [ ] Success redirects to home page
- [ ] BountyCard displays all data correctly
- [ ] Progress bar calculates and displays correctly
- [ ] isOwner logic works (shows "Your Bounty")
- [ ] Completed state shows green bar and disables button
- [ ] ClaimBountyDialog opens and closes correctly
- [ ] URL validation works for all platforms
- [ ] Platform detection displays correctly
- [ ] Link preview fetches and displays correctly
- [ ] Submission flow works for all platforms
- [ ] Error handling works in all scenarios
- [ ] Loading states display correctly
- [ ] All pages use consistent styling
- [ ] Responsive design works on all screen sizes
- [ ] No console errors
- [ ] No TypeScript errors

