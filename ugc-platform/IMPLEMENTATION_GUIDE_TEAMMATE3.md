# Components & UI/UX - Implementation Guide

**Priority:** HIGH - Can start in parallel

---

## Overview

This guide describes the component and UI/UX work needed to complete the UGC Bounty Platform. The work involves creating new components, updating existing ones, implementing styling consistency, and polishing the user experience.

---

## Task 1: Header Component

### Current State
- A `Navbar` component exists at `src/components/Navbar.tsx` with basic navigation
- Uses different styling (indigo colors, zinc backgrounds)
- Does not include bounty creation functionality
- Needs to be replaced with a new Header component

### Requirements

1. **Create New Header Component**
   - Create `src/components/Header.tsx`
   - Use Client Component directive ("use client")
   - Import necessary hooks:
     - `useUser()` from `@clerk/nextjs`
     - `useRouter()` from `next/navigation`
     - `SignInButton`, `SignUpButton`, `UserButton` from Clerk

2. **Header Layout Structure**
   - **Left Section:**
     - Link to home page (`/`)
     - Large title with custom font (consider Dancing Script)
     - Subtitle/tagline text
     - Styling: `py-6` padding, bold heading, gray-700 subtitle
   
   - **Right Section:**
     - Navigation buttons in a row
     - Each button has consistent styling:
       - `bg-transparent text-black font-semibold px-12`
       - `border-l border-r border-gray-300`
       - `hover:border-b-4 hover:border-b-black hover:cursor-pointer`
       - `transition-colors duration-200`
     - Negative margin between buttons: `-mr-px`

3. **Navigation Items**
   - **"Create Bounty" Button:**
     - Always visible (but check auth in click handler)
     - Opens modal when clicked
     - Check if user is authenticated, show alert if not
   
   - **"My Profile" Link:**
     - Only visible when user is authenticated
     - Links to `/profile`
     - Same button styling as Create Bounty
   
   - **Sign Up / Login Buttons:**
     - Only visible when user is NOT authenticated
     - Use Clerk's `<SignUpButton>` and `<SignInButton>` with `mode="modal"`
     - Wrap in button elements with same styling
   
   - **UserButton:**
     - Only visible when user is authenticated
     - Wrapped in div with `px-6 border-r border-gray-300`
     - `flex items-center` for alignment

4. **Create Bounty Modal**
   - State management for modal visibility
   - Form fields state:
     - `bountyName` (string)
     - `bountyDescription` (string)
     - `totalBounty` (string)
     - `ratePer1k` (string)
     - `companyName` (string)
     - `logoFile` (File | null)
     - `logoPreview` (string | null)
     - `isCreating` (boolean)
   
   - **Modal Structure:**
     - Fixed overlay: `fixed inset-0 bg-black/50 backdrop-blur-sm`
     - Centered modal: `bg-[#F5F1E8] border border-black`
     - Max width: `max-w-lg`
     - Padding: `p-6`
     - Close button: X in top right
   
   - **Form Fields:**
     - All inputs use: `border border-black bg-white text-black`
     - Focus: `focus:outline-none focus:border-black`
     - Placeholder: `placeholder-gray-400`
     - Labels: `block text-sm font-medium text-gray-700 mb-2`
     
   - **Logo Upload:**
     - File input: `accept="image/*"`
     - Custom file input styling with black button
     - Preview image: Display after selection (80x80px)
     - Use FileReader API to create preview

5. **Logo Upload Functionality**
   - When logo file selected:
     - Store file in state
     - Read file with FileReader
     - Set preview URL in state
     - Display preview image
   
   - On form submission:
     - If logo file exists, upload first:
       - Create FormData
       - Append file
       - POST to `/api/upload-logo`
       - Get URL from response
     - Include logo URL in bounty creation payload
     - Handle upload errors

6. **Bounty Creation API Call**
   - POST to `/api/bounties` with:
     ```json
     {
       "name": string,
       "description": string,
       "totalBounty": number,
       "ratePer1kViews": number,
       "companyName": string | null,
       "logoUrl": string | null
     }
     ```
   - Parse numeric fields: `parseFloat()`
   - Handle success:
     - Clear all form fields
     - Close modal
     - Redirect to home page (`router.push("/")`)
   - Handle errors:
     - Show alert with error message
     - Keep modal open
   
   - Loading state:
     - Disable submit button during creation
     - Show "Creating..." text
     - Disable all inputs

7. **Styling Requirements**
   - Header border: `border-b border-gray-300`
   - Background: Inherit from page (transparent)
   - Container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
   - Flex layout: `flex justify-between items-stretch`
   - Button group: `flex gap-0` with borders between

8. **Replace Navbar in Layout**
   - Update `src/app/layout.tsx`
   - Remove Navbar import and component
   - Import new Header component
   - Add Header to layout (usually before `<main>`)

---

## Task 2: BountyCard Component

### Current State
- BountyCard exists at `src/components/BountyCard.tsx`
- Uses different data structure and styling
- Needs to be updated to match reference implementation

### Requirements

1. **Update Props Interface**
   - Accept `bounty` prop with Bounty type from `data/bounties.ts`
   - Accept `onClaim` prop: `(e: React.MouseEvent) => void`
   - Accept `isOwner` prop: `boolean` (optional, default false)
   - Update interface to match reference structure

2. **Card Layout Structure**
   - Fixed height: `h-[400px]`
   - Border: `border border-gray-300`
   - Hover: `hover:border-black hover:z-10`
   - Flex column: `flex flex-col`
   - Padding: `p-6`
   - Overflow: `overflow-hidden`

3. **Progress Bar Display**
   - Calculate progress:
     - Use `progressPercentage` if available
     - Otherwise: `(claimedBounty / totalBounty) * 100`
   - Display section with:
     - Label "Progress" and remaining amount
     - Progress bar container: `border border-black h-3`
     - Filled portion with dynamic width
     - Color: Black when active, Green when completed
     - Show claimed amount and percentage below
     - Show total views if available

4. **Company Logo/Name Section**
   - If `logoUrl` or `companyName` exists:
     - Display logo image (if available)
     - Display company name
     - Border bottom: `border-b border-gray-200`
     - Spacing: `mb-4 pb-3`

5. **Bounty Information**
   - Name: `text-2xl font-bold text-black mb-3`
   - Total Bounty & Rate: Flex layout showing both
   - Description: `text-black flex-grow line-clamp-2`
   - Use line-clamp utility for text truncation

6. **Owner Logic**
   - If `isOwner === true`:
     - Show "Your Bounty" badge/text instead of submit button
     - Different styling: gray background, disabled state
   - If `isOwner === false`:
     - Show submit button or completed message

7. **Completed State Handling**
   - Check `isCompleted` prop
   - Progress bar: Green (`bg-green-500`) when completed
   - Show "$0 remaining" when completed
   - Button: Show "Bounty Completed" message (green styling)
   - Disable interaction when completed

8. **Action Button**
   - Position: `mt-auto` (bottom of card)
   - If not owner and not completed:
     - Button: `border border-black bg-transparent text-black`
     - Hover: `group-hover:bg-black group-hover:text-white`
     - Text: "Submit for this Bounty"
   - If owner:
     - Disabled state: `border border-gray-300 bg-gray-50 text-gray-500`
     - Text: "Your Bounty"
   - If completed:
     - Green styling: `border border-green-500 bg-green-50 text-green-700`
     - Text: "Bounty Completed"

9. **Grid Integration**
   - Cards should connect visually in grid
   - Use negative margins for borders to overlap
   - Z-index increase on hover
   - Responsive grid classes work with card styling

---

## Task 3: ClaimBountyDialog Component

### Current State
- Component may not exist yet
- Need to create from scratch matching reference implementation

### Requirements

1. **Component Structure**
   - Create `src/components/ClaimBountyDialog.tsx`
   - Client Component ("use client")
   - Props interface:
     ```typescript
     interface ClaimBountyDialogProps {
       bounty: Bounty;
       isOpen: boolean;
       onClose: () => void;
       isCompleted?: boolean;
     }
     ```

2. **Modal Overlay and Container**
   - Overlay: `fixed inset-0 bg-black/50 backdrop-blur-sm`
   - Container: Centered with `flex items-center justify-center`
   - Dialog: `bg-[#F5F1E8] border border-black shadow-2xl`
   - Max width: `max-w-md w-full`
   - Padding: `p-6`
   - Z-index: `z-50`

3. **Header Section**
   - Title: "Claim Bounty"
   - Close button: X in top right
   - Flex layout: `flex justify-between items-start mb-6`

4. **Bounty Information Display**
   - Show bounty name and description
   - If completed: Show warning message in green box
   - Display at top of form

5. **URL Input Field**
   - Label: "Content URL (YouTube, Instagram, or TikTok)"
   - Input type: `url`
   - Placeholder: Platform examples
   - Validation: Check if URL is from supported platform
   - Error message: Display if invalid platform
   - Success indicator: Show when valid platform detected
   - Disabled when bounty is completed

6. **Platform Detection**
   - Function to detect platform from URL:
     - YouTube: `youtube.com` or `youtu.be`
     - Instagram: `instagram.com`
     - TikTok: `tiktok.com`
   - Display detected platform name
   - Platform-specific styling or icons

7. **Link Preview Display**
   - Fetch preview when valid URL entered
   - Debounce: Wait 1 second after user stops typing
   - API endpoint: `POST /api/link-preview` with `{ url }`
   - Loading state: Show spinner with "Loading preview..."
   - Preview card displays:
     - Thumbnail image (if available)
     - Title
     - Description (truncated)
     - URL
   - Error state: Show error message if preview fails
   - Hide preview on URL change or error

8. **URL Validation Function**
   - Check URL format validity
   - Check if URL is from supported platform
   - Return validation result and error message
   - Update UI based on validation state

9. **Submission Flow**
   - **For YouTube URLs:**
     - First validate via `/api/validate-bounty`
     - Show "Validating..." state
     - If validation passes, submit to `/api/submit-bounty-item`
     - Display validation result
   
   - **For Other Platforms:**
     - Submit directly to `/api/submit-bounty-item`
     - Show loading state
     - Display success message
   
   - **Submit Payload:**
     ```json
     {
       "url": string,
       "bountyId": number
     }
     ```

10. **Validation Status Display**
    - Show validation state:
      - Validating: Blue box with spinner
      - Valid: Green box with success message
      - Invalid: Red box with error message
    - Display validation explanation from API
    - Allow retry if validation fails

11. **Loading States**
    - Preview loading: Show spinner in preview section
    - Validation loading: Show in validation box
    - Submit loading: Disable button, show "Validating..." or "Submitting..."
    - Prevent multiple submissions

12. **Error Handling**
    - Network errors: Display user-friendly message
    - API errors: Show error message from API
    - Validation errors: Display in validation box
    - Retry capability where appropriate

13. **Form Submission**
    - Submit button:
      - Disabled when: No URL, invalid URL, validating, or completed
      - Styling: `border border-black bg-transparent text-black`
      - Hover: `hover:bg-black hover:text-white`
    - Success handling:
      - Show success message
      - Auto-close after success (or provide close button)
    - Form reset on close

14. **Dialog Close Handling**
    - Close button (X) calls `onClose()`
    - Clicking overlay closes dialog
    - Reset all form state on close
    - Clear validation messages
    - Clear preview data

---

## Task 4: Styling & Layout

### Requirements

1. **Update globals.css**
   - Set CSS variables:
     ```css
     :root {
       --background: #F5F1E8;
       --foreground: #000000;
     }
     ```
   - Set body styles:
     ```css
     body {
       background: var(--background);
       color: var(--foreground);
       font-family: Arial, Helvetica, sans-serif;
     }
     ```
   - Add line-clamp utility if needed:
     ```css
     .line-clamp-2 {
       display: -webkit-box;
       -webkit-line-clamp: 2;
       -webkit-box-orient: vertical;
       overflow: hidden;
     }
     ```

2. **Update layout.tsx**
   - Change body background: `bg-[#F5F1E8]`
   - Remove any max-width containers that restrict layout
   - Add Dancing Script font (optional):
     ```typescript
     import { Dancing_Script } from "next/font/google";
     const dancingScript = Dancing_Script({
       variable: "--font-dancing-script",
       subsets: ["latin"],
     });
     ```
   - Apply to body: `${dancingScript.variable}`
   - Update structure to match reference (Header before main, no container wrapper)

3. **Remove Unnecessary Components**
   - Review all components in `src/components/`
   - Identify unused components
   - Archive or delete:
     - Components not referenced anywhere
     - Duplicate functionality
     - Old implementations
   - Clean up unused imports in layout and pages

4. **Consistent Styling Across Pages**
   - **Colors:**
     - Background: `#F5F1E8` everywhere
     - Text: Black primary, gray-700 secondary
     - Borders: `border-gray-300` or `border-black`
   
   - **Spacing:**
     - Consistent padding: `p-4`, `p-6`, `p-8`
     - Consistent margins: `mb-4`, `mb-6`
     - Consistent gaps in grids: `gap-4`, `gap-6`
   
   - **Typography:**
     - Headings: Bold, black
     - Body: Regular, black or gray-700
     - Small text: `text-sm text-gray-600`
   
   - **Borders:**
     - Light borders: `border-gray-300`
     - Strong borders: `border-black`
     - Border bottom: `border-b`
   
   - **Buttons:**
     - Primary: `bg-black text-white hover:bg-gray-800`
     - Secondary: `border border-black bg-transparent hover:bg-black hover:text-white`
     - Transitions: `transition-colors duration-200`

---

## Task 5: Polish & Bug Fixes

### Requirements

1. **End-to-End Testing**
   - **Bounty Creation Flow:**
     - Open modal → Fill form → Upload logo → Submit → Verify redirect
     - Test without logo
     - Test validation errors
     - Test API errors
   
   - **Bounty Submission Flow:**
     - Click submit → Enter URL → See preview → Validate → Submit
     - Test YouTube validation
     - Test other platforms
     - Test error scenarios
   
   - **Navigation:**
     - All links work correctly
     - Back/forward navigation works
     - Page refreshes maintain state where appropriate

2. **Styling Consistency Checks**
   - Review all pages side-by-side
   - Check color consistency
   - Check spacing consistency
   - Check border styling
   - Check typography consistency
   - Fix any inconsistencies found

3. **Error Message Implementation**
   - **Form Validation:**
     - Required field errors
     - Invalid format errors
     - File size/type errors
   
   - **API Errors:**
     - Network errors
     - Server errors
     - Validation errors from API
     - User-friendly error messages
   
   - **User Feedback:**
     - Success messages
     - Loading messages
     - Error messages with actionable guidance

4. **Loading State Improvements**
   - Add spinners where data is loading
   - Disable interactive elements during operations
   - Show progress indicators
   - Prevent duplicate submissions
   - Clear loading states after completion

5. **Accessibility**
   - Proper button labels
   - Form labels associated with inputs
   - Keyboard navigation support
   - Focus states visible
   - Screen reader friendly

6. **Responsive Design**
   - Test on mobile devices
   - Test on tablets
   - Test on desktop
   - Ensure modals work on small screens
   - Ensure grid layouts are responsive
   - Fix any overflow issues

---

## API Endpoints Reference

Verify these endpoints exist or need to be created:

1. **POST /api/upload-logo**
   - Accepts: FormData with file
   - Returns: `{ url: string }`
   - Validates: File type (images only), File size (max 5MB)
   - Uploads to Supabase Storage

2. **POST /api/link-preview**
   - Accepts: `{ url: string }`
   - Returns: `{ title, description, image, url }`
   - Fetches Open Graph data from URL

3. **POST /api/validate-bounty**
   - Accepts: `{ url: string, requirements: string }`
   - Returns: `{ valid: boolean, explanation: string }`
   - Validates YouTube video meets requirements

4. **POST /api/submit-bounty-item**
   - Accepts: `{ url: string, bountyId: number }`
   - Returns: Submission data
   - Creates submission record in database

5. **POST /api/bounties** (should exist)
   - Accepts: Bounty creation payload
   - Returns: Created bounty data

---

## Key Implementation Notes

1. **File Upload:**
   - Use FormData for file uploads
   - Validate file type and size before upload
   - Show preview before submission
   - Handle upload errors gracefully

2. **URL Validation:**
   - Validate format first
   - Check platform support
   - Provide clear error messages
   - Show success indicators

3. **Debouncing:**
   - Debounce API calls for preview
   - Wait for user to stop typing (1 second)
   - Cancel previous requests if new one starts

4. **State Management:**
   - Use React hooks for all state
   - Clear state on component unmount
   - Reset form state after submission
   - Handle loading states properly

5. **Error Handling:**
   - Always handle API errors
   - Show user-friendly messages
   - Log errors for debugging
   - Allow retry where appropriate

6. **TypeScript:**
   - Use proper types for all props
   - Type API responses
   - Type form data
   - Avoid `any` types

---

## Testing Checklist

- [ ] Header renders with all navigation items
- [ ] Create Bounty button requires authentication
- [ ] Modal opens and closes correctly
- [ ] All form fields work correctly
- [ ] Logo upload shows preview
- [ ] Logo upload handles errors
- [ ] Bounty creation submits successfully
- [ ] Success redirects to home
- [ ] BountyCard displays all data correctly
- [ ] Progress bar shows correct progress
- [ ] Owner state displays correctly
- [ ] Completed state displays correctly
- [ ] ClaimBountyDialog opens correctly
- [ ] URL validation works for all platforms
- [ ] Platform detection displays correctly
- [ ] Link preview fetches and displays
- [ ] Submission flow works for all platforms
- [ ] Loading states show correctly
- [ ] Error handling works properly
- [ ] All pages use consistent styling
- [ ] Responsive design works
- [ ] No console errors
- [ ] No TypeScript errors

