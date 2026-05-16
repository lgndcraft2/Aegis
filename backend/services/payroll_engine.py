import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest

def analyze_payroll(employees_df: pd.DataFrame, cycle_id: str):
    """
    Runs the Payroll Intelligence Engine on a DataFrame of employees.
    Returns: DataFrame with aegis_score, verdict, and a list of FraudAlert dicts.
    """
    alerts = []
    
    # Copy to avoid mutating original
    df = employees_df.copy()
    
    # Calculate some features for ML
    df['absences_ytd'] = df['absences_ytd'].fillna(0)
    df['has_service_record'] = df['has_service_record'].fillna(True)
    
    # 1. Rule-based Signals
    df['score'] = 100 # Start perfect
    
    for idx, row in df.iterrows():
        entity_id = row['employee_id']
        deductions = 0
        
        # Signal 1: Service Record Void
        if not row['has_service_record']:
            deductions += 30
            alerts.append({
                "cycle_id": cycle_id,
                "entity_type": "EMPLOYEE",
                "entity_id": entity_id,
                "signal_name": "Service Record Void",
                "description": "Salary history with zero leave, transfer, or disciplinary records.",
                "severity": "HIGH"
            })
            
        # Signal 4: Attendance Perfection Anomaly
        if row['absences_ytd'] == 0:
            deductions += 20
            alerts.append({
                "cycle_id": cycle_id,
                "entity_type": "EMPLOYEE",
                "entity_id": entity_id,
                "signal_name": "Attendance Perfection Anomaly",
                "description": "Zero absences over an extended period.",
                "severity": "MEDIUM"
            })
            
        # Deduct
        df.at[idx, 'score'] -= deductions
        
    # Signal 2: Account & BVN Clustering (Cluster analysis)
    bvn_counts = df['bvn'].value_counts()
    for bvn, count in bvn_counts.items():
        if count > 1:
            clustered_emps = df[df['bvn'] == bvn]
            for idx, row in clustered_emps.iterrows():
                df.at[idx, 'score'] -= 40
                alerts.append({
                    "cycle_id": cycle_id,
                    "entity_type": "EMPLOYEE",
                    "entity_id": row['employee_id'],
                    "signal_name": "Account & BVN Clustering",
                    "description": f"BVN {bvn} is shared by {count} employees.",
                    "severity": "HIGH"
                })
                
    # Signal 5: Grade-Pay Mismatch (Simulated with Isolation Forest on numerical features)
    # Convert grades to numerical proxy
    grade_map = {f"GL-{i:02d}": i for i in range(1, 18)}
    df['grade_num'] = df['grade_level'].map(grade_map).fillna(8)
    
    features = ['absences_ytd', 'grade_num']
    # If there are enough rows, run Isolation Forest
    if len(df) > 10:
        print(f"\n[AEGIS ML] Running IsolationForest on {len(df)} employees...")
        iso = IsolationForest(contamination=0.05, random_state=42)
        df['if_anomaly'] = iso.fit_predict(df[features])
        
        anomalies_found = len(df[df['if_anomaly'] == -1])
        print(f"[AEGIS ML] IsolationForest complete! Identified {anomalies_found} statistical outliers.\n")

        for idx, row in df[df['if_anomaly'] == -1].iterrows():
            df.at[idx, 'score'] -= 15
            alerts.append({
                "cycle_id": cycle_id,
                "entity_type": "EMPLOYEE",
                "entity_id": row['employee_id'],
                "signal_name": "Statistical Anomaly",
                "description": "Isolation Forest detected abnormal behavior compared to peers.",
                "severity": "MEDIUM"
            })

    # Floor score at 0
    df['score'] = df['score'].apply(lambda x: max(0, x))
    
    # Assign Verdict
    def get_verdict(s):
        if s >= 80: return "CLEAR"
        elif s >= 50: return "REVIEW"
        return "HOLD"
        
    df['verdict'] = df['score'].apply(get_verdict)
    
    return df, alerts
