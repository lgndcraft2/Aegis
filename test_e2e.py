import requests
import time
import json

# 1. Load demo scenario
print('=== Loading Demo Scenario 1 ===')
r = requests.post('http://localhost:8000/demo/load-scenario/1')
print(json.dumps(r.json(), indent=2))

# 2. Run surveillance with uploaded data
print('\n=== Running Surveillance ===')
r = requests.post('http://localhost:8000/run-surveillance?source=uploaded')
data = r.json()
print(json.dumps(data, indent=2))
cycle_id = data['cycle_id']

# 3. Wait for pipeline to complete
time.sleep(8)

# 4. Get results
print('\n=== Results ===')
r = requests.get(f'http://localhost:8000/results/{cycle_id}')
result = r.json()
print(f'Status: {result["status"]}')
print(f'Employees scored: {len(result.get("employees", []))}')
print(f'Vendors scored: {len(result.get("vendors", []))}')
summary = result.get('summary', {})
print(f'Total alerts: {summary.get("total_alerts", 0)}')
print(f'Intercepted: N{summary.get("intercepted_amount", 0):,.2f}')

# 5. Squad accounts
print('\n=== Squad Accounts ===')
r = requests.get(f'http://localhost:8000/squad/accounts/{cycle_id}')
sq = r.json()
print(f'Held accounts: {sq["count"]}')
print(f'Total intercepted: N{sq["total_intercepted"]:,.2f}')

# 6. Audit trail
print('\n=== Audit Trail ===')
r = requests.get(f'http://localhost:8000/audit/{cycle_id}')
audit = r.json()
print(f'Total events: {audit.get("total", 0)}')
for e in audit.get('events', []):
    print(f'  [{e["severity"]}] {e["event_type"]} - {e["entity_type"] or ""}/{e["entity_id"] or ""}')

# 7. Cycle history
print('\n=== All Cycles ===')
r = requests.get('http://localhost:8000/cycles')
cycles = r.json()
for c in cycles.get('cycles', []):
    print(f'  {c["cycle_id"]} | {c["status"]} | {c["source"]} | alerts={c["total_alerts"]} | intercepted=N{c["total_intercepted_amount"]:,.2f}')
