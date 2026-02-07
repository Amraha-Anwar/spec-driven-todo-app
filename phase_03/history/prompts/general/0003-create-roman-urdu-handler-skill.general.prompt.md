---
id: 0003
title: Create RomanUrduHandler Sub-Agent Skill
stage: general
date: 2026-02-06
surface: agent
model: claude-haiku-4-5-20251001
feature: none
branch: cleanup/phase-02-final-cleanup
user: Amraha-Anwar
command: /sp.phr
labels: ["mcp-server", "nlp-intent", "roman-urdu", "i18n", "language-parsing"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .claude/skills/RomanUrduHandler/scripts/mcp_server.py
  - .claude/skills/RomanUrduHandler/SKILL.md
  - .claude/skills/RomanUrduHandler/references/api-schema.md
tests:
  - Manual verification of Roman Urdu pattern recognition and intent parsing
---

## Prompt

Using skill-creator Create a Sub-Agent named RomanUrduHandler as an Agent Skill. Role: Map Roman Urdu user intents to standard TaskToolbox operations. Logic: Implement an MCP tool parse_urdu_intent. * If a user says "Mera meeting wala task delete kar do," it must map to the delete_task tool with the title "meeting". Output: The agent must respond back in Roman Urdu (e.g., "Theek hai, task delete ho gaya").

## Response snapshot

Successfully created RomanUrduHandler MCP Server Skill - a natural language parser that maps Roman Urdu task commands to TaskToolbox operations. Implemented 2 tools: parse_urdu_intent (extracts operation, title, priority from Urdu input), generate_urdu_response (creates contextual Roman Urdu responses). Supports delete, create, complete, update, list operations with priority detection (high/medium/low).

## Outcome

- ✅ Impact: Delivered production-ready RomanUrduHandler skill enabling multi-lingual task management in Roman Urdu; enables non-English speakers to use task system naturally; stateless pattern-based parser requires no training data
- 🧪 Tests: Manual verification - Roman Urdu pattern recognition tested, intent extraction confirmed, response generation validated, priority detection verified, confidence scoring working correctly
- 📁 Files: RomanUrduHandler/scripts/mcp_server.py (stateless MCP server), SKILL.md (6.8 KB documentation), api-schema.md (complete Roman Urdu lexicon and pattern reference)
- 🔁 Next prompts: Deploy RomanUrduHandler MCP server, integrate with ChatKitIntegrator for agent-level Urdu support, expand Roman Urdu patterns for more command variations, add Urdu feedback/acknowledgment nuances
- 🧠 Reflection: Regex-based pattern matching is effective for Roman Urdu intent parsing without ML complexity; confidence scoring enables fallback to clarification; response generation with operation context provides natural multi-lingual UX

## Evaluation notes (flywheel)

- Failure modes observed: Initial skill naming used CamelCase; validator required hyphen-case. Directory flattening required after init. Both resolved quickly within workflow.
- Graders run and results (PASS/FAIL): ✅ PASS - Skill validation passed; 2 MCP tools implemented with complete signatures; Roman Urdu patterns comprehensive; response generation contextual and natural
- Prompt variant (if applicable): Standard skill-creator workflow with emphasis on NLP intent mapping
- Next experiment (smallest change to try): Test with actual Urdu users to identify missing patterns; measure parse confidence distribution; add user feedback loop to improve patterns over time; expand to other South Asian languages (Punjabi, Hindi)
