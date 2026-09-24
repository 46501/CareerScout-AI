# CareerScout AI Profile Redesign Implementation Plan

## 1. Backend Modifications

**`apps/api/src/models/CareerProfile.ts`:**
- **personal:** Add `currentCity`, `linkedinUrl`, `githubUrl`, `portfolioUrl`.
- **education:** Add `startYear`.
- **skills:** Restructure to support categorized skills with proficiency:
  - `programmingLanguages`, `webDevelopment`, `aiMachineLearning`, `databases`, `devopsCloud` as arrays of `{ name: string, level?: string }`.
- **experience:** Add `employmentType` (Internship, Full-time, etc.), `currentlyWorking` (boolean), `location`, `technologiesUsed` (array).
- **careerGoals (NEW):** Add `lookingFor` (array), `targetRoles` (array), `interestedTechnologies` (array), `careerInterests` (array), `careerGoal` (string).
- **locationPreferences (NEW):** Add `preferredLocations` (array), `workPreference` (array of 'Remote' | 'Hybrid' | 'On-site'), `willingToRelocate` (boolean).
- Remove the old `preferences` field.

**`apps/api/src/services/profile.service.ts`:**
- Update `calculateProfileCompletion` to strictly validate the 7 new sections:
  1. Basic Info (Name, City, etc.)
  2. Education (at least 1)
  3. Technical Skills (at least 1 skill)
  4. Experience (at least 1)
  5. Career Goals (lookingFor, roles, goal)
  6. Preferred Location (locations, workPrefs)
  7. Resume (status: 'CONFIRMED' in Resume collection)

## 2. Frontend Modifications (`apps/web/src/pages/profile/Profile.tsx`)

Restructure the component to contain exactly 7 card sections.

- **Basic Information:** Photo upload, Read-only email, Social links.
- **Education:** Map through entries, add/edit cards.
- **Technical Skills:** Pre-defined category lists, autocomplete/chips, optional proficiency selection.
- **Experience:** Map through entries, timeline/card UI, add/edit cards.
- **Career Goals:** Multi-selects for `lookingFor`, `targetRoles`, `careerInterests`, plus a textarea for `careerGoal`.
- **Preferred Location:** Multi-select for `preferredLocations` and checkboxes for `workPreference` (Remote/Hybrid/Onsite) and `willingToRelocate`.
- **Resume Section:** Embed the drag-and-drop resume upload directly here. Include the mock AI processing pipeline (Upload -> Processing -> AI Analyzing -> Completed -> Review).

- **Profile Completion:** Keep the top card with the progress bar, showing exactly which of the 7 sections are missing.
- **Edit Mode:** Keep the global "Edit Profile" and "Save Changes" paradigm.

## 3. UI/UX Polish

- Ensure the design feels like a professional developer profile (similar to LinkedIn/Polywork).
- Use `lucide-react` icons for categories.
- Implement reusable chip/tag inputs for skills and roles.
- Ensure all states persist correctly to the DB on "Save Changes".
