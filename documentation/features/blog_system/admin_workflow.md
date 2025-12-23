# Blog System & Resource Center Updates

## 1. Resource Center UI Overhaul
**File:** `frontend/src/views/ResourceCenter.tsx`

The Resource Center has been upgraded to a premium, "glass-morphism" aesthetic.
- **Card Design:** Replaced standard shadcn cards with custom transparent cards (`bg-card/50 backdrop-blur-sm`).
- **Typography:** Improved hierarchy with gradients and badging.
- **Interactivity:** Added slight zoom effects on hover and "Read Article" button animations.

## 2. Admin Blog Editor Refactoring
**File:** `frontend/src/views/admin/BlogEditor.tsx`

### Native Alert Removal
The deprecated `window.prompt` for capturing update reasons has been removed.
**New Workflow:**
1. User clicks "Update Post".
2. A `shadcn/ui` **Dialog** opens requesting the "Reason for change".
3. User must provide a text reason to proceed.
4. On confirmation, the mutation is fired.

### Syntax & Routing Fixes
- Corrected import paths and component definitions.
- Resolved "JSX parent element" errors.
- **Routing:** Ensures `/blog/:slug` works alongside `/resources/:slug` to prevent 404s on preview links.

## 3. Routing Configuration
**File:** `frontend/src/App.tsx`

Added dual-route support for blog posts:
- Primary: `/resources/:slug` (Public Resource Center)
- Alias: `/blog/:slug` (Admin Previews / Legacy links)

## 4. Admin Management List
**File:** `frontend/src/views/admin/BlogList.tsx`
- **Actions Menu:** Updated Preview link to use the standard route.
- **Status Badges:** Visual indicators for Draft/Published/Scheduled states.
