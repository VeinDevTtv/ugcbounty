# Component Implementation Guide

This guide explains how to implement the missing component functionality to match `og/` behavior while keeping the existing `ugc-platform` design and colors.

## Overview

The main missing pieces are:
1. **ClaimBountyDialog** - Currently a stub, needs full submission flow
2. **Home Page** - Missing ClaimBountyDialog integration and claim button handlers
3. **BountyCard** - Missing onClaim handler to open dialog
4. **Header** - Create bounty form is incomplete

---

## Task 1: Implement ClaimBountyDialog Component

**File**: `ugc-platform/src/components/ClaimBountyDialog.tsx`

### Current State
- Has basic structure with `open`, `onOpenChange`, `bounty`, `isCompleted` props
- Missing: URL input, validation, preview, submission logic

### Implementation Steps

1. **Add State Management**
   - `url` (string) - User-entered URL
   - `isValidating` (boolean) - During validation/submission
   - `validationResult` (object) - Result from validation API
   - `urlError` (string | null) - URL format errors
   - `previewData` (object | null) - Link preview data
   - `isLoadingPreview` (boolean) - Loading preview
   - `previewError` (string | null) - Preview fetch errors

2. **Add Helper Functions**
   - `isValidSupportedUrl(url: string)`: Check if URL is from YouTube/TikTok/Instagram
   - `getPlatformFromUrl(url: string)`: Return 'youtube' | 'tiktok' | 'instagram' | 'other'
   - `fetchPreviewData(url: string)`: Call `/api/link-preview` API
   - `handleUrlChange(newUrl: string)`: Validate URL format and clear errors

3. **Add Submission Logic**
   - `submitBountyItem()`: Call `/api/submit-bounty-item` with `{ url, bountyId: bounty.id }`
   - `handleSubmit()`: 
     - For YouTube: Call `/api/validate-bounty` first, then submit if valid
     - For TikTok/Instagram: Submit directly without validation
     - Show validation result or success message

4. **Add Preview Fetching**
   - Use `useEffect` with debounce (1 second) to fetch preview when URL changes
   - Call `fetchPreviewData` when URL is valid and supported
   - Display preview with image, title, description

5. **UI Implementation**
   - Keep existing modal structure and styling
   - Add URL input field with validation feedback
   - Show platform detection message ("✓ YouTube URL detected")
   - Display preview card when available
   - Show validation result (success/error) with explanation
   - Disable submit button when: no URL, invalid URL, or validating
   - Show "Submissions Closed" when `isCompleted` is true

6. **Key Differences from og**
   - Use `bounty.id` as string (UUID) instead of number
   - Keep existing `open`/`onOpenChange` props pattern (og uses `isOpen`/`onClose`)
   - Maintain ugc-platform styling/colors

---

## Task 2: Update Home Page Integration

**File**: `ugc-platform/src/app/page.tsx`

### Current State
- Fetches and displays bounties
- Missing: ClaimBountyDialog integration, claim button handlers

### Implementation Steps

1. **Add Imports**
   - Import `ClaimBountyDialog` component
   - Import `Header` component (if not already imported)

2. **Add State**
   - `selectedBounty` (string | null) - UUID of bounty to claim
   - This replaces og's `number | null` - use string UUID

3. **Add Handler Function**
   ```typescript
   const handleClaimBounty = (bountyId: string) => {
     setSelectedBounty(bountyId)
   }
   ```

4. **Update BountyCard Usage**
   - Add `onClaim` prop to BountyCard
   - Pass handler: `onClaim={(e) => { e.preventDefault(); e.stopPropagation(); handleClaimBounty(bounty.id); }}`
   - This prevents navigation when clicking claim button

5. **Add ClaimBountyDialog Component**
   - Render at bottom of component (before closing div)
   - Pass props:
     - `open={!!selectedBounty}`
     - `onOpenChange={(open) => !open && setSelectedBounty(null)}`
     - `bounty={{ id: selectedBounty, title: ..., brand: ..., payout: ..., deadline: "Ongoing" }}`
     - `isCompleted={bounties.find(b => b.id === selectedBounty)?.isCompleted}`

6. **Add Header Component** (if not in layout)
   - Import and render `<Header />` at top of page
   - Or keep in layout if preferred

---

## Task 3: Update BountyCard Component

**File**: `ugc-platform/src/components/BountyCard.tsx`

### Current State
- Displays bounty information
- Missing: onClaim handler, click prevention

### Implementation Steps

1. **Add onClaim Prop**
   - Add to props interface: `onClaim?: (e: React.MouseEvent) => void`

2. **Update Claim Button**
   - Find the "Submit for this Bounty" button/link
   - Add `onClick={onClaim}` handler
   - Ensure it calls `e.preventDefault()` and `e.stopPropagation()` to prevent navigation

3. **Handle Owner State** (if not already)
   - Check if `isOwner` prop exists or add it
   - Show different button/text for owners vs. non-owners
   - Match og behavior: owners see "Your Bounty", others see claim button

4. **Handle Completed State**
   - Show "Bounty Completed" or similar when `isCompleted` is true
   - Disable claim button when completed

---

## Task 4: Complete Header Create Bounty Form

**File**: `ugc-platform/src/components/Header.tsx`

### Current State
- Modal opens, but form has "form continues..." comment
- Missing: Complete form implementation

### Implementation Steps

1. **Add Form State** (if not already)
   - `bountyName` (string)
   - `bountyDescription` (string)
   - `totalBounty` (string) - as string for input, convert to number
   - `ratePer1k` (string) - as string for input, convert to number
   - `companyName` (string)
   - `logoFile` (File | null)
   - `logoPreview` (string | null)
   - `isCreating` (boolean)

2. **Add Logo Upload Handler**
   - `handleLogoChange(e)`: Read file, validate type/size, create preview
   - Validate: image types only, max 5MB

3. **Add Form Submission Handler**
   - `handleCreateBounty()`:
     1. Validate all required fields
     2. If logo exists: Upload to `/api/upload-logo` (FormData)
     3. Get logo URL from response
     4. Call `/api/bounties` POST with:
        - `name`, `description`, `totalBounty` (number), `ratePer1kViews` (number)
        - `companyName` (optional), `logoUrl` (optional)
     5. On success: Clear form, close modal, redirect to home
     6. On error: Show error message

4. **Complete Form JSX**
   - Add all input fields with proper labels
   - Add file input for logo with preview
   - Add submit button with loading state
   - Add validation feedback
   - Match og field structure but keep ugc-platform styling

5. **Form Validation**
   - Required: name, description, totalBounty, ratePer1kViews
   - Optional: companyName, logo
   - Validate numbers are positive
   - Disable submit when invalid or creating

---

## Key Implementation Notes

### ID Type Handling
- **og uses**: `number` for IDs
- **ugc-platform uses**: `string` (UUID) for IDs
- Always use `bounty.id` as string, never parseInt

### API Calls
- All API calls use existing routes (already implemented)
- Use `fetch()` with proper error handling
- Show loading states during API calls

### Error Handling
- Display user-friendly error messages
- Log errors to console for debugging
- Handle network errors gracefully

### Styling
- **Keep existing ugc-platform colors and design**
- Only copy logic/functionality from og
- Use existing UI components (Button, Badge, etc.) where available

### Testing Checklist
After implementation, verify:
- [ ] Can open claim dialog from home page
- [ ] Can enter URL and see preview
- [ ] Can submit YouTube URL (validates then submits)
- [ ] Can submit TikTok/Instagram URL (submits directly)
- [ ] Can create bounty from Header modal
- [ ] Owner cannot claim own bounty
- [ ] Completed bounties show proper state
- [ ] All error states display correctly

---

## File Summary

**Files to Modify:**
1. `ugc-platform/src/components/ClaimBountyDialog.tsx` - Full implementation
2. `ugc-platform/src/app/page.tsx` - Add dialog integration
3. `ugc-platform/src/components/BountyCard.tsx` - Add onClaim handler
4. `ugc-platform/src/components/Header.tsx` - Complete form

**Files Already Correct:**
- All API routes (verified in Phase 1)
- Database schema (UUID-based)
- Type definitions

