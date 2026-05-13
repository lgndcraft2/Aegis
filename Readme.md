# AEGIS
### Autonomous Economic Guardian and Interception System

> *"Because fraud doesn't stay in one lane — and neither do we."*

---

## The Problem

Nigeria bleeds money from two wounds simultaneously — and nobody is watching both at once.

The first wound is ghost workers. The Auditor-General's 2023 report identified over 47,000 non-existent employees on federal payrolls alone. In 2022, Imo State discovered 23,000 ghost workers consuming a wage bill so inflated that real civil servants — nurses, teachers, local government clerks — went months without salary. The EFCC estimates ghost worker fraud costs Nigeria's public sector over ₦200 billion annually. The money moves every month, on schedule, to accounts controlled by the same payroll officers who created the phantom employees.

The second wound is procurement fraud. The ICPC's 2023 report documented that over 60% of investigated procurement cases involved either fictitious vendors, invoice splitting to stay below approval thresholds, or payment for goods and services that were never delivered. Shell companies collect billions from government contracts annually. Their directors are ghosts too — just wearing a different name.

These two wounds share the same blood supply. The payroll officer creating ghost workers is frequently the same actor approving inflated vendor invoices. The shell company receiving procurement payments shares bank account infrastructure with the accounts collecting ghost worker salaries. The fraud is not two problems. It is one coordinated criminal network operating across two blind spots simultaneously — and every existing solution is looking at only one blind spot at a time.

The verification failures are documented, measurable, and structural:

**Ghost worker fraud** persists because payroll systems process flat CSV files with no behavioral analysis, no cross-referencing against service records, and no detection of the statistical impossibilities that distinguish real employees from fabricated ones. By the time a government auditor flags an anomaly, the salary has been paid out for months — sometimes years.

**Procurement fraud** persists because vendor payment systems have no intelligence layer. Invoices are approved against budget lines, not against behavioral patterns. A vendor that bills ₦4.9 million eleven times in a fiscal year — always just below the ₦5 million threshold that triggers senior approval — passes through undetected because no system is watching the sequence, only the individual transaction.

**Cross-domain collusion** — the most destructive form — goes completely undetected because no system connects payroll data to procurement data to vendor identity data in a unified view. The connection between a ghost worker's salary account and a shell vendor's settlement account is invisible when you are auditing each domain in isolation. It only becomes visible when you watch the entire financial graph at once.

Nigeria's public financial management infrastructure was not built for this kind of threat. It was built for a world where fraud was individual and opportunistic. The fraud it faces today is coordinated, systemic, and intelligent. The systems catching it must be more intelligent still.

---

## The Solution

**AEGIS** — Autonomous Economic Guardian and Interception System — is a real-time, multi-domain fraud intelligence platform that monitors government payroll disbursements, procurement payments, and vendor transactions simultaneously as a unified behavioral graph, surfaces coordinated fraud rings invisible to single-domain audits, and intercepts flagged payments through Squad's financial infrastructure before they clear.

AEGIS does not audit one thing at a time. It watches everything at once — and acts before the money moves.

---

## How It Works

### Step 1 — Multi-Source Data Ingestion

A government agency connects AEGIS to three data streams: its monthly payroll CSV, its vendor payment register, and its procurement approval log. No custom integration is required per agency. AEGIS accepts standard civil service and procurement data formats and normalizes them automatically. Any ministry, parastatal, or state agency can onboard in under an hour.

### Step 2 — Parallel Domain Analysis

AEGIS runs three simultaneous intelligence engines across the ingested data:

#### Payroll Intelligence Engine

Every employee record is scored across five behavioral signals:

| Signal | What It Detects |
|---|---|
| Service Record Void | Salary history with zero leave, transfer, promotion, or disciplinary records — statistically impossible for any active worker over 12 months |
| Account & BVN Clustering | Multiple employees routing salaries to accounts sharing BVN prefixes or linked through next-of-kin records |
| Temporal Impossibility | First payment dates predating official appointment letters, or employment durations exceeding departmental founding dates |
| Attendance Perfection Anomaly | Zero absences and zero late arrivals over 24+ consecutive months — a pattern that does not occur in real human employment |
| Grade-Pay Mismatch | Salary figures inconsistent with the role classification, step, and grade level of the assigned department |

#### Procurement Intelligence Engine

Every vendor payment request is scored across four behavioral signals:

| Signal | What It Detects |
|---|---|
| Threshold Splitting | Multiple invoices from the same vendor clustering just below senior approval thresholds within a single budget cycle |
| Vendor Identity Overlap | Shell companies sharing registered directors, physical addresses, or bank account infrastructure |
| Delivery Gap | Payment requested with no corresponding goods receipt, service completion record, or delivery verification signal |
| Fiscal Year Manipulation | Invoices submitted in bulk in the final 30 days of a fiscal year to exhaust budget lines before audit |

#### Cross-Domain Collusion Engine

AEGIS builds a unified relationship graph across all three data streams — payroll records, vendor identities, and bank account infrastructure — and runs graph-based anomaly detection across the combined network.

The engine surfaces connections that are invisible when domains are audited separately: a ghost worker's salary account sharing a BVN cluster with a vendor that received ₦47 million in procurement payments. A procurement officer whose approval pattern correlates with payment spikes to vendors registered at the same address as employees in their department. A shell company whose sole director shares a phone number prefix cluster with twelve employees added to payroll in the same week.

Individually, each signal is borderline. Together, they are a coordinated fraud operation. AEGIS names the center node — the orchestrator — and maps every entity connected to them.

### Step 3 — The AEGIS Score

Every flagged entity — employee, vendor, or transaction — receives an AEGIS Risk Score from 0 to 100 with a per-signal breakdown across all active detection layers. Verdicts are clear and legally defensible:

| Verdict | Score Range | Meaning |
|---|---|---|
| **Clear** | 80–100 | No anomalies detected. Payment proceeds to disbursement. |
| **Review** | 50–79 | One or more signals require human confirmation before payment releases. |
| **Hold** | 0–49 | Multiple converging signals across one or more domains indicate coordinated fraud. Payment is automatically intercepted. |

Every flag is explainable in plain language. No black boxes. No verdicts a court cannot admit.

### Step 4 — Squad-Powered Payment Interception

When AEGIS issues a Hold verdict, the flagged payment — whether a salary disbursement or a vendor settlement — is routed to a Squad Virtual Account held in review rather than released to the destination account. The money does not move until a human auditor clears the flag or escalates to investigation.

Upon clearance, Squad Transfers release the payment to its intended recipient. Upon confirmed fraud, funds are returned to the agency account with a full audit trail attached.

Agencies are billed a per-cycle audit fee through Squad's Payment API — charged per payroll and procurement cycle processed.

Squad is not a payment layer bolted onto AEGIS. Squad is the enforcement mechanism that converts an AI verdict into a financial action — making AEGIS's output legally and financially binding at the moment of detection.

### Step 5 — Automated Audit Report Generation

Every surveillance cycle produces a structured audit report: flagged entities, risk scores, per-signal explanations, intercepted payment amounts, and a network graph of detected fraud rings. The report is generated automatically, formatted for submission to the EFCC, ICPC, or state anti-corruption bodies, and stored with a tamper-evident audit trail.

AEGIS does not just stop fraud. It builds the case file.

---

## Edge Cases & Adversarial Resilience

| Scenario | How AEGIS Handles It |
|---|---|
| Incomplete payroll or procurement data | Missing fields trigger confidence-weighted partial scoring. Low-confidence records are flagged for manual review, never auto-cleared |
| Fraudster uses a real employee's identity | BVN cross-referencing and account clustering catch salary consolidation even when individual records appear legitimate in isolation |
| New ghost worker or shell vendor with clean history | Absence of any service or delivery activity flags as anomalous after 90 days. Clean fraud has a shelf life |
| Agency disputes a flag | Every flag is explainable and fully reversible. Human auditors have override capability with complete logged audit trail |
| Coordinated bulk insertion before disbursement | Bulk addition detection flags any payroll or vendor register with more than 3% new entries in the 72 hours preceding a payment cycle |
| Fraudster aware of detection signals | Ensemble architecture — no single signal triggers a Hold. Converging signals across multiple domains are required. Gaming one layer does not defeat the system |

---

## Technical Architecture

```
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│  Payroll CSV     │   │  Vendor Payment  │   │  Procurement     │
│  Upload          │   │  Register        │   │  Approval Log    │
└────────┬─────────┘   └────────┬─────────┘   └────────┬─────────┘
         │                      │                       │
         └──────────────────────┼───────────────────────┘
                                │
                    ┌───────────▼──────────┐
                    │  Normalization &     │
                    │  Validation Layer    │
                    └───────────┬──────────┘
                                │
         ┌──────────────────────┼───────────────────────┐
         ▼                      ▼                       ▼
┌────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│  Payroll       │   │  Procurement     │   │  Cross-Domain    │
│  Intelligence  │   │  Intelligence    │   │  Collusion       │
│  Engine        │   │  Engine          │   │  Engine          │
└────────┬───────┘   └────────┬─────────┘   └────────┬─────────┘
         │                      │                       │
         └──────────────────────┼───────────────────────┘
                                │
                    ┌───────────▼──────────┐
                    │  Unified Behavioral  │
                    │  Graph + AEGIS Score │
                    └───────────┬──────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          ▼                     ▼                      ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────────┐
│ Squad Virtual   │   │ Audit Report    │   │ Agency Dashboard    │
│ Account (Hold)  │   │ Generator       │   │ + Graph Visual      │
└────────┬────────┘   └─────────────────┘   └─────────────────────┘
         │
┌────────▼────────┐
│ Squad Transfer  │
│ Release/Return  │
└─────────────────┘
```

**Stack:** Python · scikit-learn · NetworkX · pandas · FastAPI · PostgreSQL · SQLAlchemy · React · Tailwind CSS · Cytoscape.js · Recharts · Squad APIs (Virtual Accounts, Transfers, Payment)

---

## Squad API Integration

| Squad API | Function | Why It's Load-Bearing |
|---|---|---|
| Virtual Accounts | Creates segregated hold accounts per flagged transaction across payroll and procurement | Funds are isolated, traceable, and legally protected from the moment a flag fires |
| Transfers API | Releases cleared payments or returns intercepted funds to the agency account | Money movement is programmatically bound to the AEGIS verdict — no manual intervention required |
| Payment API | Bills agencies a per-cycle audit fee for every payroll and procurement cycle processed | Self-sustaining revenue model that scales with every transaction AEGIS monitors |

---

## Developer Breakdown

### Builder 1 — Backend / ML Engineer
**Owns: The brain of AEGIS**

- Synthetic dataset generation (500 employees, 120 vendors, 3 planted fraud rings)
- Payroll Intelligence Engine — Isolation Forest + rule-based flag layer
- Procurement Intelligence Engine — threshold splitting detector, vendor overlap, delivery gap analysis
- Cross-Domain Collusion Engine — NetworkX graph builder, centrality analysis, fraud ring extraction
- Audit Report Generator — structured JSON output formatted for EFCC/ICPC submission

**Stack:** Python, scikit-learn, NetworkX, pandas, Faker, FastAPI (model serving endpoints)

**API Endpoints Delivered:**
```
POST /run-payroll-analysis     → scored employee records
POST /run-procurement-analysis → scored vendor records
POST /run-collusion-graph      → graph JSON (nodes, edges, risk scores)
POST /generate-audit-report    → structured report JSON
```

---

### Builder 2 — Full-Stack Engineer
**Owns: The spine of AEGIS**

- FastAPI application layer — ingestion, orchestration, verdict engine
- Squad API integration — Virtual Accounts, Transfers, Payment billing, webhook handler
- PostgreSQL schema and audit trail
- Three hardcoded demo scenarios with pre-seeded database states
- WebSocket stream for real-time pipeline progress during demo

**Stack:** FastAPI, PostgreSQL, SQLAlchemy, Squad API SDK, Python, WebSockets

**API Contract:**
```
POST /upload/payroll          → { job_id }
POST /upload/vendors          → { job_id }
POST /run-surveillance        → { cycle_id }
GET  /results/{cycle_id}      → { employees[], vendors[], graph{}, summary{} }
GET  /squad/accounts/{cycle}  → { held_accounts[], total_intercepted }
POST /demo/load-scenario/{n}  → loads scenario 1, 2, or 3
WS   /stream/{cycle_id}       → real-time pipeline progress
```

---

### Builder 3 — Frontend Engineer
**Owns: The face of AEGIS**

- Agency dashboard — dark ops-center aesthetic, file upload, surveillance trigger, real-time status feed
- AEGIS Score Table — color-coded verdicts, expandable per-signal breakdowns, filters
- Fraud Ring Graph — Cytoscape.js interactive visualization, pulsing orchestrator nodes, edge labels, one-click ring isolation
- Squad Payment Interception Panel — live payment feed, intercepted amounts, Virtual Account IDs
- Audit Report View — formatted report display, PDF download, EFCC submission mock
- One-pager PDF design

**Stack:** React, Tailwind CSS, Cytoscape.js, Recharts, Axios

---

## Demo Script

| Time | Action |
|---|---|
| 0:00 | Open dashboard. Clean state. "This is AEGIS." |
| 0:30 | Upload synthetic payroll CSV and vendor register. Ingestion progress bar fills. |
| 1:00 | Hit Run Surveillance Cycle. Real-time status feed ticks through pipeline stages. |
| 1:45 | Score table populates. Mostly green. Then amber. Then red. Three employees. Two vendors. All Hold. |
| 2:15 | Switch to graph view. Nodes appear. Edges form. One cluster pulses red. Zoom in. Orchestrator node at center. Click it — side panel shows 2 ghost workers, 1 shell vendor, ₦23.4M exposure. |
| 3:00 | Switch to Squad panel. Five transactions intercepted. ₦23.4M held. "The money has not moved." |
| 3:30 | Open audit report. Structured. Readable. "Formatted for EFCC submission." |
| 4:00 | Close: *"Every other system would have paid these people. AEGIS stopped it before it cleared."* |
| 4:00–5:00 | Q&A buffer. |

---

## Impact

Nigeria's federal payroll covers over 1.2 million civil servants across 900+ ministries and agencies. Its annual procurement spend exceeds ₦3.5 trillion. Both streams are fraud-exposed, both are monitored in isolation today, and neither has an intelligent interception layer.

AEGIS's addressable market is every government agency running a payroll and a procurement function. The system requires no custom infrastructure per agency. Any payroll CSV and vendor register is a valid input. The marginal cost of onboarding a new agency is near zero.

A conservative deployment across three pilot states — Imo, Rivers, and Kaduna — would process an estimated 400,000 employee records and 15,000 vendor transactions per month. At published fraud rate estimates of 8–12% of total wage bills and 15–20% of procurement spend, the financial exposure AEGIS monitors in those three states alone exceeds ₦40 billion annually.

Beyond Nigeria, every African nation running a civil service with centralized payroll and procurement infrastructure faces the same structural vulnerability. AEGIS requires only localized data format adaptation to deploy continent-wide.

---

## Build Timeline

| | Day 1 | Day 2 | Day 3 |
|---|---|---|---|
| **Builder 1** | Synthetic dataset + anomaly detection model + payroll engine | Procurement engine + graph builder + collusion detection | Audit report generator + model tuning + endpoint polish |
| **Builder 2** | FastAPI scaffold + DB schema + data ingestion endpoints | Squad API integration (all three APIs) + verdict engine + demo hardcoding | End-to-end integration testing + bug fixes + demo scenario seeding |
| **Builder 3** | Dashboard shell + file upload + score table | Graph visualization + Squad interception panel | Audit report view + one-pager + demo rehearsal support |