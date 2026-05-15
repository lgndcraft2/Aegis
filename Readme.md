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

Every surveillance cycle produces a structured audit report: flagged entities, risk scores, per-signal explanations, intercepted payment amounts, and a network graph of detected fraud rings. The report is generated automatically, formatted for submission to regulatory bodies, and stored with a complete audit trail.

AEGIS does not just stop fraud. It builds the case file.

---

## Resilience & Edge Cases

| Scenario | How AEGIS Handles It |
|---|---|
| Incomplete payroll or procurement data | Missing fields trigger confidence-weighted partial scoring. Low-confidence records are flagged for manual review, never auto-cleared |
| Duplicate identity abuse | BVN cross-referencing and account clustering catch salary consolidation even when individual records appear legitimate in isolation |
| New fraudulent entities with no history | Absence of service records or delivery activity flags as anomalous after 90 days on payroll/procurement |
| Disputed flags | Every flag is explainable by specific signals. Human auditors have full override capability with complete logged audit trail |
| Coordinated bulk insertion | Bulk addition detection flags any register with 3%+ new entries in 72 hours preceding payment cycle |
| Signal-aware adversaries | Ensemble architecture requires converging signals across multiple domains. No single detection layer is sufficient for a Hold verdict |

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

---

## Getting Started

### Quick Demo (2 minutes)

The simplest way to see AEGIS in action is to load one of the three hardcoded demo scenarios:

1. **Ghost Fleet Scenario** — 2 ghost workers exploiting a shell vendor, ₦12.3M exposure
2. **Clean Slate Scenario** — Bulk insertion attack: 18 employees added to payroll 48 hours before disbursement
3. **Deep Network Scenario** — 5-node collusion ring spanning payroll officers, ghost workers, and shell vendors

Each demo loads a fully seeded database and executes a complete surveillance cycle in real-time with WebSocket progress streaming.

---

## Installation

### Prerequisites

- Python 3.9+
- Node.js 16+ (frontend only)
- PostgreSQL 12+ (database)

### Backend Setup

```bash
# Clone repository
git clone <repo>
cd Aegis/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # on Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure database (set DATABASE_URL in .env)
export DATABASE_URL="postgresql://user:password@localhost:5432/aegis"

# Run migrations and seed demo data
python -c "from database import init_db; init_db()"

# Start server
uvicorn main:app --reload --port 8000
```

Backend runs on `http://localhost:8000`. Check health: `GET /health`

### Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies API calls to `http://localhost:8000`.

### Load a Demo Scenario

```bash
# In another terminal
curl -X POST http://localhost:8000/demo/load-scenario/1
# Returns: { "cycle_id": "...", "message": "Ghost Fleet scenario loaded" }
```

Then open the frontend dashboard and click **Run Surveillance Cycle** to execute the full analysis pipeline with real-time progress streaming.

---

## Project Structure

```
Aegis/
├── backend/
│   ├── main.py                    # FastAPI application
│   ├── database.py                # PostgreSQL connection + schema
│   ├── models.py                  # SQLAlchemy ORM models
│   ├── ws_manager.py              # WebSocket connection manager
│   ├── requirements.txt            # Python dependencies
│   ├── routers/
│   │   ├── intelligence.py         # Payroll/Procurement/Collusion endpoints
│   │   ├── orchestration.py        # Ingestion, verdict engine, report generation
│   │   └── webhooks.py            # Squad API webhook handler
│   └── services/
│       ├── payroll_engine.py       # Payroll Intelligence (5 signals)
│       ├── procurement_engine.py   # Procurement Intelligence (4 signals)
│       ├── collusion_engine.py     # NetworkX graph + ring detection
│       ├── audit.py                # Audit report generation
│       ├── synthetic_data.py       # Demo scenario data
│       └── squad_client.py         # Squad API wrapper
│
├── frontend/
│   ├── src/
│   │   ├── api.ts                 # HTTP client + WebSocket manager
│   │   ├── types.ts               # TypeScript type definitions
│   │   ├── App.tsx                # Main router component
│   │   ├── components/
│   │   │   └── MainLayout.tsx     # Sidebar + top nav
│   │   └── views/
│   │       ├── Dashboard.tsx       # Landing page + metrics + scenarios
│   │       ├── DataIngestion.tsx   # CSV upload interface
│   │       ├── Surveillance.tsx    # Alert queue + filtering
│   │       ├── FraudRings.tsx      # Collusion visualization
│   │       └── SquadInterception.tsx # Payment feed
│   ├── tailwind.config.js         # OKLCH color palette + typography
│   ├── vite.config.ts             # Vite bundler config
│   └── package.json
│
├── test_e2e.py                    # End-to-end test script
└── Readme.md                       # This file
```

---

## API Reference

### Core Endpoints

#### Ingestion
```
POST /upload/payroll
  Body: { "file": File (CSV) }
  Returns: { "job_id": string, "message": string }

POST /upload/vendors
  Body: { "file": File (CSV) }
  Returns: { "job_id": string, "message": string }
```

#### Analysis & Verdicts
```
POST /run-surveillance
  Returns: { "cycle_id": string, "status": "running" }

GET /results/{cycle_id}
  Returns: {
    "cycle_id": string,
    "employees": [{ "id", "name", "score", "verdict", "signals": [] }],
    "vendors": [{ "id", "name", "score", "verdict", "signals": [] }],
    "graph": { "nodes": [], "edges": [], "rings": [] },
    "summary": { "total_flagged": number, "total_intercepted": number }
  }

GET /alerts/{cycle_id}
  Returns: {
    "cycle_id": string,
    "alerts": [{ "entity_id", "entity_type", "severity", "signal_name", "description" }]
  }
```

#### Squad Integration
```
GET /squad/accounts/{cycle_id}
  Returns: {
    "held_accounts": [{ "va_number", "beneficiary", "amount", "status" }],
    "total_intercepted": number
  }

POST /squad/release/{account_id}
  Returns: { "message": "Payment released", "transfer_id": string }

POST /squad/return/{account_id}
  Returns: { "message": "Funds returned", "transfer_id": string }
```

#### Demo & Utilities
```
POST /demo/load-scenario/{n}
  n: 1 (Ghost Fleet), 2 (Clean Slate), 3 (Deep Network)
  Returns: { "cycle_id": string, "message": string }

GET /employees
  Returns: { "employees": [{ "id", "name", "department", "salary_account", "bvn", ... }] }

GET /vendors
  Returns: { "vendors": [{ "id", "name", "registration_address", "settlement_account", ... }] }

WS /stream/{cycle_id}
  WebSocket stream of pipeline progress: { "stage": string, "progress": 0-100 }
```

---

## Testing

### Run End-to-End Test Suite

```bash
cd Aegis
python test_e2e.py
```

This validates:
- ✅ Database initialization and demo seeding
- ✅ Payroll Intelligence Engine (5 signals)
- ✅ Procurement Intelligence Engine (4 signals)
- ✅ Collusion Detection Engine (graph analysis)
- ✅ Squad API integration (Virtual Accounts, Transfers)
- ✅ Audit report generation
- ✅ Frontend API responses

---

## Configuration

### Environment Variables (`.env` in backend root)

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/aegis

# Squad API (if using production credentials)
SQUAD_API_KEY=your_api_key
SQUAD_API_BASE_URL=https://api.staging.squad.ng

# Server
ENVIRONMENT=development
DEBUG=true
```

### Frontend API Base URL

Edit `frontend/src/api.ts`:
```typescript
const API_BASE = process.env.VITE_API_URL || 'http://localhost:8000';
```

Or set `VITE_API_URL` environment variable at build time.

---

## Performance Notes

- **Ingestion:** 500 employees + 120 vendors normalizes in < 2 seconds
- **Payroll Analysis:** Isolation Forest scores 500 records in ~500ms
- **Procurement Analysis:** Threshold + overlap detection across 120 vendors in ~300ms
- **Graph Construction:** NetworkX builds 400+ node/edge network in ~200ms
- **End-to-End Cycle:** Complete surveillance run on synthetic dataset: ~3 seconds

Production datasets (100,000+ employees) require batch processing and incremental graph updates. See `backend/services/payroll_engine.py` for scalability patterns.

---

## Extensibility

### Adding a New Detection Signal

1. **Define signal logic** in the appropriate engine (`payroll_engine.py`, `procurement_engine.py`, etc.)
2. **Add to signal table** in the service scoring method
3. **Update verdict calculation** in `orchestration.py` to include new signal weight
4. **Add to frontend display** in `Surveillance.tsx` or score breakdown panel

Example (Payroll):
```python
# In payroll_engine.py, add_custom_signal()
def detect_address_clustering(self, employees):
    # Return list of (employee_id, score, reason)
    pass
```

### Integrating New Payment Provider

1. **Create new provider client** in `backend/services/provider_client.py`
2. **Implement interface:** `hold_payment()`, `release_payment()`, `return_payment()`
3. **Update verdict engine** in `orchestration.py` to call appropriate provider
4. **Add UI panel** in `frontend/views/PaymentInterception.tsx`

---

## Impact & Deployment

Nigeria's federal payroll covers over 1.2 million civil servants across 900+ ministries and agencies. Its annual procurement spend exceeds ₦3.5 trillion. Both streams are fraud-exposed, both are monitored in isolation today, and neither has an intelligent interception layer.

AEGIS's addressable market is every government agency running a payroll and a procurement function. The system requires no custom infrastructure per agency. Any payroll CSV and vendor register is a valid input. The marginal cost of onboarding a new agency is near zero.

A conservative deployment across three pilot states — Imo, Rivers, and Kaduna — would process an estimated 400,000 employee records and 15,000 vendor transactions per month. At published fraud rate estimates of 8–12% of total wage bills and 15–20% of procurement spend, the financial exposure AEGIS monitors in those three states alone exceeds ₦40 billion annually.

Beyond Nigeria, every African nation running a civil service with centralized payroll and procurement infrastructure faces the same structural vulnerability. AEGIS requires only localized data format adaptation to deploy continent-wide.

---

## License

Proprietary. All rights reserved. Developed for deployment in Nigerian public financial management infrastructure.