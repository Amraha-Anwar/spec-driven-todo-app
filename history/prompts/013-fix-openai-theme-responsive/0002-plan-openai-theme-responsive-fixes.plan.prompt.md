---
id: 0002
title: Plan OpenAI Theme Responsive Fixes
stage: plan
date: 2026-02-07
surface: agent
model: claude-haiku-4-5-20251001
feature: 013-fix-openai-theme-responsive
branch: 013-fix-openai-theme-responsive
user: amrahaanwar
command: /sp.plan
labels: ["backend-openai", "frontend-theme", "mobile-responsive", "design-planning"]
links:
  spec: /mnt/d/todo-evolution/specs/013-fix-openai-theme-responsive/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/013-fix-openai-theme-responsive/plan.md
  - phase_03/backend/src/api/chat/routes.py (TO MODIFY)
  - phase_03/frontend/app/layout.tsx (TO MODIFY)
  - phase_03/frontend/components/chat/ChatWidget.tsx (TO MODIFY)
  - phase_03/frontend/tailwind.config.ts (ALREADY CONFIGURED)
tests:
  - Constitution check: 6/6 gates pass
  - Technical context: All parameters defined
  - Design specifications: 4 detailed designs
  - Risk analysis: 6 identified risks with mitigations
  - Success criteria: 12+ measurable outcomes
---

## Prompt

User Command: `/sp.plan`

Input: Feature specification with 3 P1 user stories and 11 functional requirements for fixing:
1. Backend OpenAI import error (NameError causing 500 errors)
2. Burgundy theme inconsistency (#865A5B not applied consistently)
3. Mobile responsiveness failure (ChatWidget not visible on <640px)

## Response snapshot

### Implementation Plan Created Successfully

Comprehensive 386-line implementation plan with:

**Technical Context**:
- Language/Version: TypeScript (Frontend), Python 3.11 (Backend)
- Primary Dependencies: Next.js, React, FastAPI, OpenRouter, Tailwind
- Platform: Web (Browser)
- Performance: <2s chat response, <500ms UI render
- Scale: 5 files affected, ~50 lines changed

**Constitutional Compliance**: ✅ ALL GATES PASS
- Stateless Architecture ✅
- Tool-First Execution ✅
- Privacy & Isolation ✅
- API Integration ✅
- User Experience ✅
- Data Integrity ✅

**Design Specifications** (4 detailed designs):
1. Backend OpenAI Client Fix
   - Add `from openai import OpenAI` import
   - Initialize with OpenRouter base URL
   - Location: phase_03/backend/src/api/chat/routes.py
   - Impact: Fixes 500 errors → 200 success

2. Burgundy Theme Application
   - Replace hardcoded hex (#865A5B) with Tailwind `burgundy` class
   - Ensure Montserrat (headers) and Poppins (body) fonts
   - Location: phase_03/frontend/components/chat/ChatWidget.tsx
   - Impact: Visual consistency + brand alignment

3. Global Layout Injection
   - Add `<ChatWidget />` to RootLayout
   - Makes chat visible on all pages
   - Location: phase_03/frontend/app/layout.tsx
   - Impact: Fixes "chat icon missing" issue

4. Responsive Styling Verification
   - Confirm Tailwind config has burgundy + fonts
   - No changes needed (already configured in Feature 012)
   - Location: phase_03/frontend/tailwind.config.ts
   - Impact: Ensures responsive breakpoints work

**Risk Analysis**: 6 identified risks with mitigations
- Low probability, high visibility
- All risks mitigated by existing configuration

**Performance Impact**: <5KB bundle increase
- No new dependencies
- Tailwind classes only
- Fonts already cached from Feature 012

**Testing Strategy**:
- Unit: OpenAI client, ChatWidget rendering, responsive classes
- Integration: Message sending, theme consistency, mobile layout
- Visual: Desktop/tablet/mobile viewports
- Device: iOS (16px input fix), Android (responsiveness)

**Success Criteria**: 12+ measurable outcomes across:
- Functional (API status, no errors)
- Visual (colors, fonts, consistency)
- Responsive (mobile/desktop sizing)
- Build quality (TypeScript, no console errors)

---

## Outcome

- ✅ Impact: Complete implementation plan created for feature 013, enabling efficient task generation and development. All 3 critical issues are clearly defined with surgical changes (5 files, ~50 lines total). Constitutional compliance verified (6/6 gates pass). Plan is ready for `/sp.tasks` to generate detailed test-driven tasks.
- 🧪 Tests: Constitution check (6/6 gates pass), Technical context (complete), Design specifications (4 detailed), Risk analysis (6 risks + mitigations), Success criteria (12+ outcomes), Testing strategy (unit, integration, visual, device-level).
- 📁 Files: plan.md (386 lines, comprehensive), PHR (this document), 5 source files identified (1 backend, 4 frontend). No new dependencies, no database changes.
- 🔁 Next prompts: `/sp.tasks` to generate task list; implementation via test-driven development.
- 🧠 Reflection: Plan successfully consolidates three interconnected issues into a coherent implementation roadmap. All technical decisions are justified. Risk mitigation strategies are concrete. Ready for execution phase.

## Evaluation notes (flywheel)

- Failure modes observed: None during planning
- Graders run and results (PASS/FAIL): PASS - Constitution gates all pass, no violations, all artifacts complete
- Prompt variant (if applicable): N/A
- Next experiment: Proceed to `/sp.tasks` to generate detailed tasks with test cases and dependencies
