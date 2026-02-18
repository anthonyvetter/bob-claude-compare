# Customer Portal — Risk Analysis & Mitigation

## 1. CRM Integration (Highest Combined Risk)

**Why it's the most dangerous:** Every other feature — the dashboard metrics, user profiles,
and data sync — depends on what the CRM can actually deliver. If API limitations surface in
Phase 3, you face rework across multiple systems simultaneously.

**Mitigations:**
- Run a dedicated CRM API spike in Week 1 of Phase 1. Map every data field the portal needs
  to an actual API endpoint.
- Define a data contract (OpenAPI spec) between the CRM and portal before any frontend work begins.
- Build the integration layer with an anti-corruption layer — portal code never calls CRM APIs
  directly, only through an internal abstraction. This isolates CRM-specific quirks and makes
  future CRM changes cheap.
- Implement a sync audit log from day one so data discrepancies are visible and traceable.
- Agree on a fallback: what does the portal display if the CRM is unavailable? Define graceful
  degradation behavior up front.

---

## 2. Authentication & Compliance (High Impact if Wrong)

**Why it's dangerous:** Auth errors are security incidents. Compliance gaps (GDPR, data residency,
retention policies) can block launch entirely or create legal liability.

**Mitigations:**
- Don't build auth from scratch — use a proven identity provider (Auth0, Cognito, Okta, etc.)
  and configure it rather than implement it.
- Involve your security and legal teams in a Phase 1 threat model session. Identify data
  classification requirements before the data model is designed.
- Define document retention and deletion policies before building the document service —
  retrofitting these is expensive.
- Schedule a pen test for mid-Phase 4, not end-of-phase, so there's time to remediate findings
  before launch.

---

## 3. Scope Creep on Dashboard Metrics

**Why it's dangerous:** "Key metrics" is ambiguous. Stakeholders will keep adding metrics, each
requiring new CRM queries, caching logic, and UI work. This is the most likely cause of
schedule pressure.

**Mitigations:**
- Lock a v1 metrics list in Phase 1 with explicit sign-off from all stakeholders. Put it in writing.
- Establish a change request process before Phase 3 starts — new metrics after sign-off go on a
  v2 backlog, not into the current build.
- Build the dashboard as a configurable widget framework rather than hardcoded panels, so adding
  future metrics is low-cost. This is the one place where slightly more upfront investment pays off.

---

## 4. Performance Under Load

**Why it's dangerous:** Document-heavy portals with real-time CRM data are naturally slow if not
designed for it. Performance issues found at launch are high-visibility and hard to fix quickly.

**Mitigations:**
- Set explicit performance budgets in Phase 1 (e.g., dashboard load < 2s, document list < 1s)
  and measure against them continuously in CI.
- Design caching strategy early: what CRM data can be cached and for how long? Stale data
  tolerance varies by metric.
- Large file uploads must use direct-to-storage (e.g., presigned S3 URLs) — never proxy through
  your application server.
- Run load tests in Phase 4 before pen testing, not after.

---

## 5. Key Person Risk

**Why it's dangerous:** CRM integration knowledge and auth architecture tend to concentrate in one
or two people. If they leave or are unavailable, work stops.

**Mitigations:**
- Require architecture decisions to be written down (ADRs) as they are made, not retrospectively.
- Mandate pair programming or regular cross-training on the CRM integration specifically.
- The DevOps setup (infra, CI/CD, secrets management) must be documented well enough that a
  second person can operate it independently.

---

## Priority Order for Action

| Priority | Risk | First Action |
|---|---|---|
| 1 | CRM Integration | Schedule CRM API audit in Week 1 |
| 2 | Auth & Compliance | Threat model session with security + legal in Phase 1 |
| 3 | Scope Creep | Stakeholder sign-off on locked v1 metrics list before Phase 3 |
| 4 | Performance | Define performance budgets and add measurement to CI in Phase 2 |
| 5 | Key Person Risk | ADR process and cross-training plan established in Phase 2 |
