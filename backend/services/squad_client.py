import uuid

class SquadClient:
    def __init__(self, api_key: str = "mock_key"):
        self.api_key = api_key
        self.held_accounts = {}
        
    def create_virtual_account(self, entity_id: str, amount: float) -> str:
        """Mocks creating a Squad Virtual Account to hold intercepted funds."""
        account_id = f"SQ_VA_{uuid.uuid4().hex[:8].upper()}"
        self.held_accounts[account_id] = {
            "entity_id": entity_id,
            "amount": amount,
            "status": "HELD"
        }
        return account_id
        
    def release_transfer(self, account_id: str, destination_account: str) -> bool:
        """Mocks releasing a held payment."""
        if account_id in self.held_accounts:
            self.held_accounts[account_id]["status"] = "RELEASED"
            return True
        return False
        
    def return_to_agency(self, account_id: str) -> bool:
        """Mocks returning fraud funds to the agency account."""
        if account_id in self.held_accounts:
            self.held_accounts[account_id]["status"] = "RETURNED"
            return True
        return False
        
    def bill_audit_fee(self, cycle_id: str, num_transactions: int) -> dict:
        """Mocks the Payment API billing the agency per transaction processed."""
        fee_per_tx = 50.0 # NGN 50 per transaction audited
        return {
            "cycle_id": cycle_id,
            "amount_billed": num_transactions * fee_per_tx,
            "status": "PAID"
        }

squad_client = SquadClient()
