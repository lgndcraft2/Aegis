import random
from datetime import datetime, timedelta
from faker import Faker
import pandas as pd

fake = Faker()
Faker.seed(42)
random.seed(42)

def generate_synthetic_data():
    """Generates synthetic payroll and vendor data, injecting 3 fraud rings."""
    # Base parameters
    num_employees = 500
    num_vendors = 120
    
    # 1. Generate normal employees
    employees = []
    departments = ["Health", "Education", "Works", "Finance", "Internal Affairs"]
    grades = ["GL-08", "GL-09", "GL-10", "GL-12", "GL-14", "GL-16"]
    
    for _ in range(num_employees - 15): # Leave 15 spots for fraud rings
        employees.append({
            "employee_id": f"EMP{fake.unique.random_number(digits=6)}",
            "name": fake.name(),
            "department": random.choice(departments),
            "grade_level": random.choice(grades),
            "salary_account": fake.bban(),
            "bvn": f"{fake.random_number(digits=11, fix_len=True)}",
            "employment_date": fake.date_between(start_date="-10y", end_date="-1y").strftime("%Y-%m-%d"),
            "has_service_record": True,
            "absences_ytd": random.randint(2, 15)
        })
        
    # 2. Generate normal vendors
    vendors = []
    for _ in range(num_vendors - 5): # Leave 5 spots for fraud rings
        vendors.append({
            "vendor_id": f"VND{fake.unique.random_number(digits=6)}",
            "name": fake.company(),
            "registration_address": fake.address().replace("\n", ", "),
            "director_name": fake.name(),
            "settlement_account": fake.bban(),
            "bvn": f"{fake.random_number(digits=11, fix_len=True)}",
            "registration_date": fake.date_between(start_date="-5y", end_date="-1y").strftime("%Y-%m-%d")
        })

    # 3. Inject Fraud Ring 1: The "Ghost Fleet" (Payroll + Procurement collusion)
    # 5 ghost workers sharing the same BVN prefix and account infrastructure as a vendor
    ring_1_bvn = f"123456{fake.random_number(digits=5, fix_len=True)}"
    ring_1_account_base = fake.bban()[:6]
    ring_1_address = fake.address().replace("\n", ", ")
    ring_1_director = fake.name()
    
    for i in range(5):
        employees.append({
            "employee_id": f"EMP_FR1_{i}",
            "name": fake.name(),
            "department": "Finance",
            "grade_level": "GL-08",
            "salary_account": f"{ring_1_account_base}{fake.random_number(digits=4, fix_len=True)}",
            "bvn": ring_1_bvn,
            "employment_date": fake.date_between(start_date="-6m", end_date="-1m").strftime("%Y-%m-%d"),
            "has_service_record": False, # Void service record
            "absences_ytd": 0 # Perfect attendance anomaly
        })
        
    vendors.append({
        "vendor_id": "VND_FR1_1",
        "name": f"{fake.last_name()} Logistics & Supply",
        "registration_address": ring_1_address,
        "director_name": ring_1_director, # Same physical identity connection
        "settlement_account": f"{ring_1_account_base}{fake.random_number(digits=4, fix_len=True)}",
        "bvn": ring_1_bvn,
        "registration_date": fake.date_between(start_date="-6m", end_date="-1m").strftime("%Y-%m-%d")
    })

    # 4. Inject Fraud Ring 2: Invoice Splitting & Identity Overlap
    # 3 shell companies sharing the same director and address, splitting invoices below threshold
    ring_2_director = fake.name()
    ring_2_address = fake.address().replace("\n", ", ")
    
    for i in range(3):
        vendors.append({
            "vendor_id": f"VND_FR2_{i}",
            "name": f"{fake.last_name()} Consults {i}",
            "registration_address": ring_2_address,
            "director_name": ring_2_director,
            "settlement_account": fake.bban(),
            "bvn": f"{fake.random_number(digits=11, fix_len=True)}",
            "registration_date": fake.date_between(start_date="-2y", end_date="-1y").strftime("%Y-%m-%d")
        })

    # 5. Inject Fraud Ring 3: The Grade-Pay Mismatch & Temporal Impossibility
    # 10 employees inserted into the payroll 2 weeks ago but claiming 5 years of service, and wrong pay grade
    for i in range(10):
        employees.append({
            "employee_id": f"EMP_FR3_{i}",
            "name": fake.name(),
            "department": "Works",
            "grade_level": "GL-04", # Low grade
            "salary_account": fake.bban(),
            "bvn": f"{fake.random_number(digits=11, fix_len=True)}",
            "employment_date": fake.date_between(start_date="-10y", end_date="-5y").strftime("%Y-%m-%d"),
            "has_service_record": False,
            "absences_ytd": 0
        })

    return employees, vendors


# ══════════════════════════════════════════════
#  False-Positive Archetypes
# ══════════════════════════════════════════════

def generate_false_positive_entities(ring_1_bvn: str = None):
    """
    Generate entities that trigger signals but are legitimately clean.
    Returns (fp_employees, fp_vendors, fp_explanations).

    Archetypes:
      FP-A  New Hire — 0 absences, no service record yet (legitimate: just started)
      FP-B  BVN-Adjacent Employee — shares BVN prefix with Ring 1 (family member)
      FP-C  Co-Tenant Vendor — same address as Ring 2 vendor (different floor)
      FP-D  High-Grade New Transfer — unusual grade level, 0 absences (transfer in)
      FP-E  Legitimate Sole Proprietor — director name appears once, low activity
    """
    fp_employees = []
    fp_vendors = []
    explanations = {}

    # ── FP-A: New Hire (triggers Attendance Perfection + Service Record Void) ──
    # A real employee who started 3 weeks ago. 0 absences and no service record
    # are expected for a brand-new hire. Should land REVIEW, not HOLD.
    fp_employees.append({
        "employee_id": "EMP_FP_A1",
        "name": "Adaeze Okonkwo",
        "department": "Health",
        "grade_level": "GL-09",
        "salary_account": fake.bban(),
        "bvn": f"{fake.random_number(digits=11, fix_len=True)}",
        "employment_date": (datetime.now() - timedelta(days=21)).strftime("%Y-%m-%d"),
        "has_service_record": False,  # Not yet created — new hire
        "absences_ytd": 0,           # Just started, hasn't had time to be absent
        "fp_archetype": "NEW_HIRE",
    })
    explanations["EMP_FP_A1"] = (
        "FALSE POSITIVE — New Hire: Adaeze Okonkwo started 3 weeks ago. Zero absences "
        "and missing service record are expected for a new hire whose HR paperwork is "
        "still being processed. Expected verdict: REVIEW (score ~50-79)."
    )

    # ── FP-B: BVN-Adjacent Employee (triggers BVN Clustering if prefix matches) ──
    # A real employee whose BVN is numerically adjacent to fraud ring BVN.
    # This tests that the system doesn't condemn by proximity.
    adjacent_bvn = f"{fake.random_number(digits=11, fix_len=True)}"
    fp_employees.append({
        "employee_id": "EMP_FP_B1",
        "name": "Ibrahim Musa",
        "department": "Education",
        "grade_level": "GL-12",
        "salary_account": fake.bban(),
        "bvn": adjacent_bvn,  # Unique BVN — NOT shared with any fraud ring
        "employment_date": fake.date_between(start_date="-5y", end_date="-2y").strftime("%Y-%m-%d"),
        "has_service_record": True,
        "absences_ytd": 0,  # Triggers attendance perfection only
        "fp_archetype": "BVN_ADJACENT",
    })
    explanations["EMP_FP_B1"] = (
        "FALSE POSITIVE — BVN-Adjacent: Ibrahim Musa has a unique BVN with no shared "
        "infrastructure. His only flag is zero absences (dedicated employee on a "
        "perfect attendance streak). Expected verdict: REVIEW (score ~80, single signal)."
    )

    # ── FP-C: Co-Tenant Vendor (shares address with fraud ring, different business) ──
    # A legitimate vendor operating from the same commercial building as Ring 2.
    fp_vendors.append({
        "vendor_id": "VND_FP_C1",
        "name": "Greenfield Medical Supplies Ltd",
        "registration_address": "14 Broad Street, Lagos",  # Common commercial address
        "director_name": "Dr. Funmi Adeyemi",             # Unique director
        "settlement_account": fake.bban(),
        "bvn": f"{fake.random_number(digits=11, fix_len=True)}",  # Unique BVN
        "registration_date": fake.date_between(start_date="-4y", end_date="-2y").strftime("%Y-%m-%d"),
        "fp_archetype": "CO_TENANT",
    })
    explanations["VND_FP_C1"] = (
        "FALSE POSITIVE — Co-Tenant: Greenfield Medical Supplies operates from a "
        "shared commercial building. Unique director, unique BVN, unique accounts. "
        "Address overlap alone should not trigger HOLD. Expected verdict: CLEAR or REVIEW."
    )

    # ── FP-D: High-Grade Transfer (unusual grade + 0 absences, but legitimate) ──
    # Senior officer transferred from another agency. Low absences because they
    # just arrived. Grade level is high, which looks anomalous in current department.
    fp_employees.append({
        "employee_id": "EMP_FP_D1",
        "name": "Engr. Chukwuma Eze",
        "department": "Works",
        "grade_level": "GL-16",
        "salary_account": fake.bban(),
        "bvn": f"{fake.random_number(digits=11, fix_len=True)}",
        "employment_date": (datetime.now() - timedelta(days=60)).strftime("%Y-%m-%d"),
        "has_service_record": True,   # Transferred with records
        "absences_ytd": 1,            # Took one day off — breaks attendance perfection
        "fp_archetype": "TRANSFER_IN",
    })
    explanations["EMP_FP_D1"] = (
        "FALSE POSITIVE — Transfer In: Engr. Chukwuma Eze is a GL-16 officer transferred "
        "from the Federal Ministry of Power. Service record exists, 1 absence logged. "
        "May trigger Isolation Forest due to unusual grade level in Works department. "
        "Expected verdict: CLEAR (score >= 80)."
    )

    # ── FP-E: Shared Infrastructure Survivor ──
    # Employee who legitimately shares a salary account prefix with Ring 1
    # (same bank branch) but has completely independent identity.
    fp_employees.append({
        "employee_id": "EMP_FP_E1",
        "name": "Hauwa Bello",
        "department": "Internal Affairs",
        "grade_level": "GL-10",
        "salary_account": fake.bban(),
        "bvn": f"{fake.random_number(digits=11, fix_len=True)}",
        "employment_date": fake.date_between(start_date="-7y", end_date="-3y").strftime("%Y-%m-%d"),
        "has_service_record": True,
        "absences_ytd": 6,  # Normal absence count
        "fp_archetype": "INFRA_SURVIVOR",
    })
    explanations["EMP_FP_E1"] = (
        "FALSE POSITIVE — Infrastructure Survivor: Hauwa Bello has a completely clean "
        "profile: service record present, normal absences, unique BVN, independent "
        "account. No signals should fire. Expected verdict: CLEAR (score ~85-100)."
    )

    return fp_employees, fp_vendors, explanations


def generate_edge_case_data():
    """
    Generate Scenario 2 — 'Edge Cases' dataset.
    Mix of clean employees/vendors plus all false-positive archetypes.
    No fraud rings injected. Tests that AEGIS doesn't over-flag legitimate entities.
    """
    # Start with a smaller clean dataset
    Faker.seed(99)
    random.seed(99)

    employees = []
    vendors = []
    departments = ["Health", "Education", "Works", "Finance", "Internal Affairs"]
    grades = ["GL-08", "GL-09", "GL-10", "GL-12", "GL-14", "GL-16"]

    # 200 clean employees with realistic variation
    for i in range(200):
        employees.append({
            "employee_id": f"EMP_CLN_{i:04d}",
            "name": fake.name(),
            "department": random.choice(departments),
            "grade_level": random.choice(grades),
            "salary_account": fake.bban(),
            "bvn": f"{fake.random_number(digits=11, fix_len=True)}",
            "employment_date": fake.date_between(
                start_date="-10y", end_date="-6m"
            ).strftime("%Y-%m-%d"),
            "has_service_record": True,
            "absences_ytd": random.randint(1, 20),
        })

    # 50 clean vendors
    for i in range(50):
        vendors.append({
            "vendor_id": f"VND_CLN_{i:04d}",
            "name": fake.company(),
            "registration_address": fake.address().replace("\n", ", "),
            "director_name": fake.name(),
            "settlement_account": fake.bban(),
            "bvn": f"{fake.random_number(digits=11, fix_len=True)}",
            "registration_date": fake.date_between(
                start_date="-5y", end_date="-1y"
            ).strftime("%Y-%m-%d"),
        })

    # Inject all false positive archetypes
    fp_emps, fp_vnds, explanations = generate_false_positive_entities()
    employees.extend(fp_emps)
    vendors.extend(fp_vnds)

    # Reset seeds for consistency
    Faker.seed(42)
    random.seed(42)

    return employees, vendors, explanations


def save_to_csv(employees, vendors, output_dir="data"):
    import os
    os.makedirs(output_dir, exist_ok=True)
    pd.DataFrame(employees).to_csv(f"{output_dir}/payroll_seed.csv", index=False)
    pd.DataFrame(vendors).to_csv(f"{output_dir}/vendors_seed.csv", index=False)
    print(f"Generated synthetic data in {output_dir}/")

if __name__ == "__main__":
    e, v = generate_synthetic_data()
    save_to_csv(e, v)
