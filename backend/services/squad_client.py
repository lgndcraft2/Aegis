import os
import uuid
import hmac
import hashlib
import logging
import requests
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("aegis.squad")


class SquadClient:
    """
    Real Squad API client for Virtual Accounts, Transfers, and Payments.
    
    Docs: https://docs.squadco.com
    Sandbox: https://sandbox-api-d.squadco.com
    Production: https://api-d.squadco.com
    """

    def __init__(self):
        self.secret_key = os.getenv("SQUAD_SECRET_KEY", "")
        self.merchant_id = os.getenv("SQUAD_MERCHANT_ID", "")
        env = os.getenv("SQUAD_ENVIRONMENT", "sandbox")
        
        if env == "production":
            self.base_url = "https://api-d.squadco.com"
        else:
            self.base_url = "https://sandbox-api-d.squadco.com"

        self.configured = bool(self.secret_key and self.merchant_id)
        if not self.configured:
            logger.warning(
                "Squad API keys not configured. Set SQUAD_SECRET_KEY and SQUAD_MERCHANT_ID in .env. "
                "Squad calls will be simulated."
            )
        
        # In-memory fallback for when API keys aren't set (demo/dev mode)
        self._fallback_accounts = {}

    @property
    def _headers(self) -> dict:
        return {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json",
        }

    def _make_tx_ref(self, suffix: str = "") -> str:
        """Generate a transaction reference prefixed with merchant ID (Squad requirement)."""
        uid = uuid.uuid4().hex[:12].upper()
        ref = f"{self.merchant_id}_{uid}"
        if suffix:
            ref = f"{ref}_{suffix}"
        return ref

    # ──────────────────────────────────────────────
    #  Virtual Accounts — Business Model
    # ──────────────────────────────────────────────

    def create_virtual_account(
        self,
        customer_identifier: str,
        business_name: str,
        mobile_num: str = "08000000000",
        bvn: str = "22110011001",
        beneficiary_account: Optional[str] = None,
    ) -> dict:
        """
        Create a Squad Virtual Account (Business model) to hold intercepted funds.
        
        POST /virtual-account/business
        
        Returns dict with keys: virtual_account_number, customer_identifier, success, etc.
        """
        if not self.configured:
            # Fallback simulation
            va_number = f"07{uuid.uuid4().hex[:8]}"
            result = {
                "success": True,
                "simulated": True,
                "data": {
                    "virtual_account_number": va_number,
                    "customer_identifier": customer_identifier,
                    "business_name": business_name,
                    "bank_code": "058",
                },
            }
            self._fallback_accounts[va_number] = {
                "customer_identifier": customer_identifier,
                "business_name": business_name,
                "status": "HELD",
            }
            logger.info(f"[SIMULATED] Created VA {va_number} for {customer_identifier}")
            return result

        payload = {
            "customer_identifier": customer_identifier,
            "business_name": business_name,
            "mobile_num": mobile_num,
            "bvn": bvn,
        }
        
        # Use provided account, or fallback to environment variable
        beneficiary = beneficiary_account or os.getenv("SQUAD_BENEFICIARY_ACCOUNT")
        if beneficiary:
            payload["beneficiary_account"] = beneficiary

        try:
            resp = requests.post(
                f"{self.base_url}/virtual-account/business",
                json=payload,
                headers=self._headers,
                timeout=30,
            )
            data = resp.json()
            logger.info(f"Squad VA create response: {resp.status_code} — {data.get('message', '')}")
            return data
        except Exception as e:
            logger.error(f"Squad VA create failed: {e}")
            return {"success": False, "message": str(e), "data": {}}

    # ──────────────────────────────────────────────
    #  Transfers — Fund Transfer
    # ──────────────────────────────────────────────

    def initiate_transfer(
        self,
        amount_kobo: int,
        bank_code: str,
        account_number: str,
        account_name: str,
        remark: str = "AEGIS Payment Release",
    ) -> dict:
        """
        Transfer funds from Squad wallet to a bank account.
        
        POST /payout/transfer
        
        Amount is in Kobo (100 kobo = 1 NGN).
        Transaction reference is auto-generated with merchant ID prefix.
        """
        tx_ref = self._make_tx_ref("TRF")

        if not self.configured:
            logger.info(f"[SIMULATED] Transfer ₦{amount_kobo/100:.2f} to {account_number} ({account_name})")
            return {
                "success": True,
                "simulated": True,
                "data": {
                    "transaction_reference": tx_ref,
                    "amount": str(amount_kobo),
                    "account_number": account_number,
                    "account_name": account_name,
                },
            }

        payload = {
            "transaction_reference": tx_ref,
            "amount": str(amount_kobo),
            "bank_code": bank_code.zfill(6),
            "account_number": account_number,
            "account_name": account_name,
            "currency_id": "NGN",
            "remark": remark,
        }

        try:
            resp = requests.post(
                f"{self.base_url}/payout/transfer",
                json=payload,
                headers=self._headers,
                timeout=30,
            )
            data = resp.json()
            logger.info(f"Squad transfer response: {resp.status_code} — {data.get('message', '')}")
            return data
        except Exception as e:
            logger.error(f"Squad transfer failed: {e}")
            return {"success": False, "message": str(e), "data": {}}

    # ──────────────────────────────────────────────
    #  Transfers — Account Lookup
    # ──────────────────────────────────────────────

    def account_lookup(self, bank_code: str, account_number: str) -> dict:
        """
        Verify/lookup a bank account before transfer.
        
        POST /payout/account/lookup
        """
        if not self.configured:
            logger.info(f"[SIMULATED] Account lookup: {bank_code}/{account_number}")
            return {
                "success": True,
                "simulated": True,
                "data": {
                    "account_name": "SIMULATED ACCOUNT",
                    "account_number": account_number,
                },
            }

        payload = {
            "bank_code": bank_code.zfill(6),
            "account_number": account_number,
        }

        try:
            resp = requests.post(
                f"{self.base_url}/payout/account/lookup",
                json=payload,
                headers=self._headers,
                timeout=30,
            )
            return resp.json()
        except Exception as e:
            logger.error(f"Squad account lookup failed: {e}")
            return {"success": False, "message": str(e), "data": {}}

    # ──────────────────────────────────────────────
    #  Transfers — Re-query
    # ──────────────────────────────────────────────

    def requery_transfer(self, transaction_reference: str) -> dict:
        """
        Re-query the status of a transfer.
        
        POST /payout/requery
        """
        if not self.configured:
            return {
                "success": True,
                "simulated": True,
                "data": {"transaction_reference": transaction_reference, "transaction_status": "success"},
            }

        payload = {"transaction_reference": transaction_reference}

        try:
            resp = requests.post(
                f"{self.base_url}/payout/requery",
                json=payload,
                headers=self._headers,
                timeout=30,
            )
            return resp.json()
        except Exception as e:
            logger.error(f"Squad requery failed: {e}")
            return {"success": False, "message": str(e), "data": {}}

    # ──────────────────────────────────────────────
    #  Merchant — Wallet Balance
    # ──────────────────────────────────────────────

    def get_wallet_balance(self, currency_id: str = "NGN") -> dict:
        """
        Get merchant wallet balance.
        
        GET /merchant/balance
        """
        if not self.configured:
            return {
                "success": True,
                "simulated": True,
                "data": {"balance": "0.00", "currency_id": currency_id},
            }

        try:
            resp = requests.get(
                f"{self.base_url}/merchant/balance?currency_id={currency_id}",
                headers=self._headers,
                timeout=30,
            )
            return resp.json()
        except Exception as e:
            logger.error(f"Squad balance lookup failed: {e}")
            return {"success": False, "message": str(e), "data": {}}

    # ──────────────────────────────────────────────
    #  Payments — Initiate Payment (Billing)
    # ──────────────────────────────────────────────

    def initiate_payment(
        self,
        amount_kobo: int,
        email: str,
        currency: str = "NGN",
        metadata: Optional[dict] = None,
    ) -> dict:
        """
        Initiate a payment (used for billing agencies per audit cycle).
        
        POST /transaction/initiate
        
        Returns a checkout_url the agency can be redirected to.
        """
        tx_ref = self._make_tx_ref("BILL")

        if not self.configured:
            logger.info(f"[SIMULATED] Billing ₦{amount_kobo/100:.2f} to {email}")
            return {
                "success": True,
                "simulated": True,
                "data": {
                    "transaction_reference": tx_ref,
                    "checkout_url": f"https://sandbox-pay.squadco.com/pay/{tx_ref}",
                    "amount": amount_kobo,
                },
            }

        payload = {
            "amount": amount_kobo,
            "email": email,
            "currency": currency,
            "initiate_type": "inline",
            "transaction_ref": tx_ref,
        }
        if metadata:
            payload["metadata"] = metadata

        try:
            resp = requests.post(
                f"{self.base_url}/transaction/initiate",
                json=payload,
                headers=self._headers,
                timeout=30,
            )
            return resp.json()
        except Exception as e:
            logger.error(f"Squad payment initiation failed: {e}")
            return {"success": False, "message": str(e), "data": {}}

    # ──────────────────────────────────────────────
    #  Billing helper for audit cycles
    # ──────────────────────────────────────────────

    def bill_audit_fee(
        self,
        cycle_id: str,
        num_transactions: int,
        email: str = "agency@aegis.ng",
        fee_per_tx_ngn: float = 50.0,
    ) -> dict:
        """
        Bill the agency a per-transaction audit fee for the surveillance cycle.
        Returns billing details including the checkout URL if real keys are configured.
        """
        total_ngn = num_transactions * fee_per_tx_ngn
        amount_kobo = int(total_ngn * 100)

        result = self.initiate_payment(
            amount_kobo=amount_kobo,
            email=email,
            metadata={"cycle_id": cycle_id, "num_transactions": num_transactions},
        )

        logger.info(
            f"Audit fee for cycle {cycle_id}: {num_transactions} txns × ₦{fee_per_tx_ngn} = ₦{total_ngn:.2f}"
        )
        return {
            "cycle_id": cycle_id,
            "num_transactions": num_transactions,
            "fee_per_tx": fee_per_tx_ngn,
            "total_amount_ngn": total_ngn,
            "squad_response": result,
        }

    # ──────────────────────────────────────────────
    #  Webhook Signature Verification
    # ──────────────────────────────────────────────

    def verify_webhook_signature(self, body: bytes, signature: str) -> bool:
        """
        Verify Squad webhook signature.
        The x-squad-encrypted-body header is an HMAC-SHA512 of the request body
        signed with the secret key.
        """
        if not self.secret_key:
            logger.warning("No secret key configured — skipping webhook verification")
            return True  # Allow in dev mode

        computed = hmac.new(
            self.secret_key.encode("utf-8"),
            body,
            hashlib.sha512,
        ).hexdigest().upper()

        return hmac.compare_digest(computed, signature.upper())


# Singleton instance
squad_client = SquadClient()
