# Customer Portal Initiative
# Project Kickoff Meeting Agenda

---

| | |
|---|---|
| **Meeting Date** | [Date] |
| **Time** | [Start Time] – [End Time] (90 minutes) |
| **Location / Link** | [Conference Room / Video Call Link] |
| **Facilitator** | [Product Manager Name] |
| **Note Taker** | [Assigned Name] |
| **Distribution** | All attendees + stakeholders listed in project charter |

---

## Attendees

| Name | Role | Required |
|---|---|---|
| [Name] | Executive Sponsor | Yes |
| [Name] | Product Manager | Yes |
| [Name] | Tech Lead / Architect | Yes |
| [Name] | Backend Engineer(s) | Yes |
| [Name] | Frontend Engineer(s) | Yes |
| [Name] | UX/UI Designer | Yes |
| [Name] | DevOps / Platform Engineer | Yes |
| [Name] | QA Engineer | Yes |
| [Name] | CRM Admin / SME | Yes |
| [Name] | IT / Security Representative | Yes |
| [Name] | Legal / Compliance Representative | Optional |

---

## Meeting Objectives

By the end of this meeting, attendees will:

1. Share a common understanding of the project's purpose, scope, and success criteria.
2. Understand their individual roles, responsibilities, and decision-making authority.
3. Agree on how the team will work together (process, tools, communication cadence).
4. Surface and align on the most critical early risks and open questions.
5. Leave with clear, owned action items for the first week of Phase 1.

---

## Agenda

### 1. Welcome & Introductions `[0:00 – 0:10]` (10 min)

**Facilitator:** Executive Sponsor

- Welcome from the Executive Sponsor — why this project matters to the business
- Brief round-table introductions (name, role, what you're contributing to the project)
- Meeting ground rules: one conversation at a time, decisions logged, parking lot for
  off-topic items

---

### 2. Project Context & Strategic Fit `[0:10 – 0:20]` (10 min)

**Facilitator:** Executive Sponsor / Product Manager

**Discussion Points:**
- What business problem is the customer portal solving?
- How does this initiative connect to company strategy and OKRs?
- What does success look like from an executive perspective?
- Why now — what's the urgency or opportunity cost of not acting?

**Key Message to Land:**
> This is not just a technology project. It is a customer experience initiative with
> measurable business outcomes attached.

---

### 3. Project Overview: Scope, Phases & Deliverables `[0:20 – 0:40]` (20 min)

**Facilitator:** Product Manager + Tech Lead

#### 3a. Scope Walkthrough (10 min)

**Discussion Points:**
- In-scope features for v1:
  - User authentication and profiles (SSO, MFA)
  - Customer dashboard with CRM-sourced metrics
  - Document upload and management
  - Mobile-responsive design
  - CRM integration layer
- Explicitly out of scope for v1 (native mobile apps, payments, collaboration features)
- Why scope boundaries exist — protect the team from overcommit

**Decision Item D1:**
> Does the full team agree on the v1 scope as presented?
> Any concerns must be raised now or submitted in writing within 48 hours.

#### 3b. Phases & Milestones (10 min)

**Discussion Points:**
- Walk through the five phases: Discovery, Foundation, Core Features, Polish & Hardening,
  Launch & Stabilization
- Key milestones and go/no-go gates (emphasize M1 CRM audit and M3 metrics lock)
- How phase gate reviews work and who has sign-off authority
- Phased rollout plan at launch (canary → percentage → full GA)

---

### 4. Roles & Responsibilities `[0:40 – 0:50]` (10 min)

**Facilitator:** Product Manager

**Discussion Points:**
- Walk the RACI: who is Responsible, Accountable, Consulted, Informed for key decisions
- Clarify decision-making authority:
  - Scope decisions → Product Manager (above threshold: Executive Sponsor)
  - Architecture decisions → Tech Lead
  - Security / compliance decisions → IT/Security + Legal
  - Budget decisions → Executive Sponsor
- How to escalate when you're blocked or disagree
- The CRM SME role: this person is a critical dependency — surface availability constraints now

**Decision Item D2:**
> Is everyone clear on their role and decision-making authority?
> Any gaps in ownership must be resolved before the end of this meeting.

---

### 5. Ways of Working `[0:50 – 1:05]` (15 min)

**Facilitator:** Product Manager + Tech Lead

#### 5a. Tools & Process (8 min)

**Discussion Points:**
- Project management tool: [Jira / Linear / Shortcut — confirm]
- Source control: [GitHub / GitLab — confirm]
- Communication: [Slack / Teams — confirm channels and norms]
- Documentation: [Confluence / Notion — confirm]
- Design: [Figma — confirm]
- Meeting cadence:
  - Daily standup: [time, channel]
  - Weekly team sync: [day/time]
  - Bi-weekly stakeholder status report (written)
  - Monthly steering committee with Executive Sponsor
  - Sprint reviews at end of each sprint

**Decision Item D3:**
> Confirm and agree on tooling choices and meeting cadence.

#### 5b. Definition of Done & Quality Bar (7 min)

**Discussion Points:**
- Code review requirements (minimum reviewers, Tech Lead review for architecture changes)
- Definition of Done for a feature: coded, reviewed, tested, documented, accessible
- Branching strategy overview
- How bugs are triaged and prioritized
- Performance budgets: < 2s page load, < 300ms API response (P95)
- Accessibility standard: WCAG 2.1 AA — non-negotiable

---

### 6. Risk Review & Open Questions `[1:05 – 1:20]` (15 min)

**Facilitator:** Tech Lead

**Discussion Points:**
Walk the top five risks and confirm mitigation ownership with the team:

| Risk | Mitigation Lead | First Action | Due |
|---|---|---|---|
| CRM API limitations | Tech Lead | CRM API audit | Week 1 |
| Scope creep on metrics | Product Manager | Lock metrics list by end of Phase 1 | Phase 1 gate |
| Auth/compliance underestimated | Tech Lead + Legal | Threat model session | Week 2 |
| Document compliance gaps | Legal + Tech Lead | Data retention policy defined | Phase 1 gate |
| Performance under load | Tech Lead | Performance budgets into CI | Phase 2 start |

**Open Questions — Parking Lot:**
Capture any questions the team raises that cannot be resolved today.

| # | Question | Owner | Resolution Due |
|---|---|---|---|
| | | | |
| | | | |

**Decision Item D4:**
> Is each risk mitigation action assigned to a named owner with a clear due date?

---

### 7. Phase 1 Priorities & First-Week Actions `[1:20 – 1:28]` (8 min)

**Facilitator:** Product Manager

**Phase 1 Focus:**
The single most important outcome of Phase 1 is resolving the CRM integration unknowns.
Everything else depends on it.

**Immediate Priorities (Week 1):**
- Schedule and execute the CRM API audit
- Set up project tooling (repo, project board, communication channels)
- Schedule the Phase 1 threat model session with IT/Security and Legal
- Begin drafting the OpenAPI data contract (CRM ↔ portal)
- Identify beta customers for the future rollout program (Customer Success team action)

---

### 8. Q&A & Close `[1:28 – 1:30]` (2 min)

**Facilitator:** Executive Sponsor / Product Manager

- Final questions
- Confirm note taker will distribute meeting notes and action items within 24 hours
- Thank the team — reiterate excitement and importance of the initiative

---

## Decision Log

*To be completed during the meeting.*

| ID | Decision | Made By | Date |
|---|---|---|---|
| D1 | v1 scope confirmed / concerns raised | | |
| D2 | Roles and ownership confirmed | | |
| D3 | Tooling and meeting cadence agreed | | |
| D4 | Risk owners and due dates confirmed | | |

---

## Action Items

*To be completed during the meeting and distributed within 24 hours.*

| # | Action Item | Owner | Due Date | Status |
|---|---|---|---|---|
| 1 | Schedule CRM API audit session with CRM SME | Tech Lead | [Date] | Open |
| 2 | Set up project repo, board, and Slack channels | DevOps | [Date] | Open |
| 3 | Schedule Phase 1 threat model session (IT/Security + Legal) | PM | [Date] | Open |
| 4 | Draft v1 metrics list for stakeholder sign-off | PM + CRM SME | [Date] | Open |
| 5 | Begin OpenAPI data contract draft (CRM ↔ portal) | Tech Lead | [Date] | Open |
| 6 | Identify beta customer candidates | Customer Success | [Date] | Open |
| 7 | Distribute meeting notes and this action log | Note Taker | 24 hrs post-meeting | Open |
| 8 | [Add items raised during meeting] | | | |

---

## Parking Lot

*Items raised during the meeting that require follow-up but could not be resolved in session.*

| # | Item | Owner | Follow-Up By |
|---|---|---|---|
| | | | |
| | | | |

---

## Pre-Reading (Distribute 48 Hours Before Meeting)

Attendees should review the following documents before the kickoff:

1. `customer-portal-project-charter.md` — Full project charter including scope, milestones,
   stakeholder map, budget framework, and risk register
2. `customer-portal-project-plan.md` — Phase breakdown and deliverables
3. `customer-portal-risk-analysis.md` — Detailed risk analysis and mitigation strategies

---

*Meeting notes and completed action items will be distributed within 24 hours of the meeting.
Questions before the meeting? Contact [Product Manager Name] at [email].*
