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

def save_to_csv(employees, vendors, output_dir="data"):
    import os
    os.makedirs(output_dir, exist_ok=True)
    pd.DataFrame(employees).to_csv(f"{output_dir}/payroll_seed.csv", index=False)
    pd.DataFrame(vendors).to_csv(f"{output_dir}/vendors_seed.csv", index=False)
    print(f"Generated synthetic data in {output_dir}/")

if __name__ == "__main__":
    e, v = generate_synthetic_data()
    save_to_csv(e, v)
