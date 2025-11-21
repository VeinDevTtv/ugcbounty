# TEAM MEMBER 3: Components & UI/UX

**Priority:** HIGH - Can start in parallel

---

## Tasks

### Header Component

1. **Create app/components/Header.tsx matching reference structure**
   - Client Component with Clerk authentication hooks
   - Use `useUser()` and `useRouter()` from Next.js/Clerk
   - Implement state management for modal and form fields

2. **Create bounty modal with form**
   - Modal opens when "Create Bounty" button is clicked
   - Check if user is authenticated, show alert if not
   - Form fields:
     - Bounty Name (required)
     - Company Name (optional)
     - Company Logo (file upload, optional)
     - Description (required, textarea)
     - Total Bounty in $ (required, number)
     - Rate per 1k Views in $ (required, number, step 0.01)
   - Form validation before submission
   - Loading state during creation

3. **Logo upload functionality**
   - File input accepts image files (image/*)
   - Preview uploaded logo before submission
   - Upload to `/api/upload-logo` endpoint
   - Use FormData to send file
   - Get URL back from API and include in bounty creation
   - Handle upload errors gracefully

4. **Connect to /api/bounties POST**
   - Submit form data to `/api/bounties` POST endpoint
   - Include logo URL if uploaded
   - Handle success: clear form, close modal, redirect to home
   - Handle errors: show alert with error message
   - Disable submit button during creation

5. **Replace current Navbar with Header**
   - Remove existing Navbar component from layout
   - Import and use new Header component
   - Ensure Header is rendered in layout

6. **Match styling (#F5F1E8 background, borders, etc.)**
   - Background: `bg-[#F5F1E8]`
   - Header border: `border-b border-gray-300`
   - Black text on light background
   - Button hover effects with border-bottom animation
   - Link styling with hover states
   - Modal styling with black borders and matching background

7. **Header layout and navigation**
   - Left side: Logo/title with tagline, links to home
   - Right side: 
     - "Create Bounty" button (authenticated users)
     - "My Profile" link (authenticated users)
     - Sign Up / Login buttons (unauthenticated users)
     - UserButton component (authenticated users)
   - All buttons/links have consistent border styling
   - Hover effects: `hover:border-b-4 hover:border-b-black`

---

### BountyCard Component

1. **Update existing to match reference structure**
   - Review current BountyCard component
   - Update props interface to match Bounty type from data/bounties.ts
   - Ensure all fields are properly typed and used

2. **Add progress bar display**
   - Show progress bar with percentage
   - Display claimed amount and remaining amount
   - Show total views from submissions (if available)
   - Use calculated `progressPercentage` if available, otherwise calculate from `claimedBounty`
   - Progress bar fills from 0-100% based on progress

3. **Add isOwner logic**
   - Accept `isOwner` prop (boolean, optional, default false)
   - Show "Your Bounty" badge/text when `isOwner` is true
   - Hide "Submit for this Bounty" button when owner
   - Different styling or message for owned bounties

4. **Match styling (borders, colors, hover effects)**
   - Border: `border border-gray-300`
   - Hover: `hover:border-black` with z-index increase
   - Grid items should connect visually (negative margins for borders)
   - Consistent spacing and padding
   - Black text, gray accents
   - Background: white cards on `#F5F1E8` background

5. **Handle completed state (green bar)**
   - Check `isCompleted` prop or calculate from progress
   - Progress bar turns green when `isCompleted === true`
   - Show "$0 remaining" when completed
   - Disable claim button when completed
   - Show "Bounty Completed" message

6. **Card structure and content**
   - Company logo and name (if available) at top
   - Bounty name as heading
   - Total bounty and rate display
   - Progress bar section
   - Description (line-clamp-2 for truncation)
   - Action button at bottom (Submit/Your Bounty/Completed)
   - Fixed height: `h-[400px]` with flex layout

---

### ClaimBountyDialog Component

1. **Create app/components/ClaimBountyDialog.tsx matching reference**
   - Client Component with state management
   - Props: `bounty`, `isOpen`, `onClose`, `isCompleted` (optional)
   - Modal overlay with backdrop blur
   - Centered modal with max width

2. **URL validation and preview**
   - Validate URL format
   - Check if URL is from supported platforms (YouTube, Instagram, TikTok)
   - Show error message for invalid URLs
   - Show success indicator when valid URL is detected
   - Disable submission until valid URL entered

3. **Platform detection UI**
   - Detect platform from URL:
     - YouTube: youtube.com, youtu.be
     - Instagram: instagram.com
     - TikTok: tiktok.com
   - Display platform name/icon when detected
   - Show platform-specific validation messages

4. **Link preview display**
   - Fetch preview data from `/api/link-preview` endpoint
   - Display while loading: spinner with "Loading preview..."
   - Show preview card with:
     - Thumbnail image (if available)
     - Title
     - Description (if available)
     - URL
   - Handle preview errors gracefully
   - Debounce API calls (wait 1 second after typing stops)

5. **Submit to /api/submit-bounty-item**
   - For YouTube: Validate video first via `/api/validate-bounty`
   - For other platforms: Submit directly
   - Show validation state while processing
   - Display success/error messages
   - Close dialog on successful submission

6. **Loading states**
   - Show loading spinner while fetching preview
   - Show "Validating..." message during validation
   - Disable submit button during processing
   - Loading indicators with appropriate styling

7. **Error handling**
   - Display validation errors clearly
   - Show API error messages
   - Handle network errors
   - Provide user-friendly error messages
   - Allow retry after errors

8. **Dialog UI and interactions**
   - Modal overlay: `bg-black/50 backdrop-blur-sm`
   - Modal container: `bg-[#F5F1E8] border border-black`
   - Close button (X) in top right
   - Form inputs with black borders
   - Submit button disabled when form invalid or processing
   - Success/error messages with color-coded styling

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

## API Endpoints Needed

- `POST /api/bounties` - Create new bounty (should already exist)
- `POST /api/upload-logo` - Upload logo file (may need to be created)
- `POST /api/link-preview` - Get link preview data (may need to be created)
- `POST /api/validate-bounty` - Validate YouTube video (may need to be created)
- `POST /api/submit-bounty-item` - Submit content to bounty (may need to be created)

**Note:** Verify which endpoints exist and which need to be created. Coordinate with team for API routes.

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

