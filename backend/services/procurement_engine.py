import pandas as pd

def analyze_procurement(vendors_df: pd.DataFrame, cycle_id: str):
    alerts = []
    df = vendors_df.copy()
    df['score'] = 100
    
    # Signal 2: Vendor Identity Overlap
    # Check for same director name or same address among vendors
    director_counts = df['director_name'].value_counts()
    for director, count in director_counts.items():
        if count > 1:
            clustered = df[df['director_name'] == director]
            for idx, row in clustered.iterrows():
                df.at[idx, 'score'] -= 40
                alerts.append({
                    "cycle_id": cycle_id,
                    "entity_type": "VENDOR",
                    "entity_id": row['vendor_id'],
                    "signal_name": "Vendor Identity Overlap",
                    "description": f"Director '{director}' is registered to {count} different vendors.",
                    "severity": "HIGH"
                })

    address_counts = df['registration_address'].value_counts()
    for address, count in address_counts.items():
        if count > 1:
            clustered = df[df['registration_address'] == address]
            for idx, row in clustered.iterrows():
                # Avoid double penalty if director was already same
                if df.at[idx, 'score'] > 60:
                    df.at[idx, 'score'] -= 30
                    alerts.append({
                        "cycle_id": cycle_id,
                        "entity_type": "VENDOR",
                        "entity_id": row['vendor_id'],
                        "signal_name": "Vendor Physical Overlap",
                        "description": f"Address shared by {count} vendors.",
                        "severity": "MEDIUM"
                    })

    df['score'] = df['score'].apply(lambda x: max(0, x))
    
    def get_verdict(s):
        if s >= 80: return "CLEAR"
        elif s >= 50: return "REVIEW"
        return "HOLD"
        
    df['verdict'] = df['score'].apply(get_verdict)
    return df, alerts
