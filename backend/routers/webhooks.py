import json
import logging
from fastapi import APIRouter, Request, HTTPException
from backend.database import SessionLocal
from backend.services.squad_client import squad_client
from backend.services.audit import log_event

logger = logging.getLogger("aegis.webhooks")

router = APIRouter(tags=["webhooks"])


@router.post("/webhooks/squad")
async def squad_webhook(request: Request):
    """
    Receives Squad payment/transfer webhook notifications.
    
    Squad sends POST requests with:
    - Header: x-squad-encrypted-body (HMAC-SHA512 signature)
    - Body: JSON with Event, TransactionRef, Body (payment details)
    
    Webhook events: charge_successful (for payments and VA credits)
    """
    body_bytes = await request.body()
    
    # Verify signature
    signature = request.headers.get("x-squad-encrypted-body", "")
    if not squad_client.verify_webhook_signature(body_bytes, signature):
        logger.warning("Webhook signature verification failed")
        raise HTTPException(status_code=401, detail="Invalid signature")

    try:
        payload = json.loads(body_bytes)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    event = payload.get("Event", "")
    tx_ref = payload.get("TransactionRef", "")
    body_data = payload.get("Body", {})

    logger.info(f"Squad webhook received: event={event}, ref={tx_ref}")

    # Log to audit trail
    db = SessionLocal()
    try:
        log_event(
            db=db,
            cycle_id=None,  # Webhooks may not be tied to a specific cycle
            event_type="WEBHOOK_RECEIVED",
            entity_type="TRANSACTION",
            entity_id=tx_ref,
            details={
                "event": event,
                "transaction_ref": tx_ref,
                "amount": body_data.get("amount"),
                "transaction_status": body_data.get("transaction_status"),
                "transaction_type": body_data.get("transaction_type"),
                "currency": body_data.get("currency"),
                "merchant_amount": body_data.get("merchant_amount"),
            },
            severity="INFO",
        )

        # Handle specific events
        if event == "charge_successful":
            tx_status = body_data.get("transaction_status", "")
            amount = body_data.get("amount", 0)
            tx_type = body_data.get("transaction_type", "")
            
            logger.info(
                f"Successful charge: type={tx_type}, amount={amount}, status={tx_status}"
            )

            # If this is a virtual account credit (interception hold receiving funds),
            # we could update the corresponding transaction record here.
            # For now, we log it and the dashboard can query the audit trail.

    except Exception as e:
        logger.error(f"Error processing webhook: {e}")
        db.rollback()
    finally:
        db.close()

    # Squad expects a 200 OK response
    return {"status": 200, "message": "Webhook received"}


@router.post("/webhooks/squad/va")
async def squad_va_webhook(request: Request):
    """
    Receives Squad Virtual Account webhook notifications.
    
    These are sent when money is deposited into a virtual account.
    Uses x-squad-signature header for verification (HMAC-SHA512).
    """
    body_bytes = await request.body()

    # VA webhooks use x-squad-signature
    signature = request.headers.get(
        "x-squad-signature",
        request.headers.get("x-squad-encrypted-body", ""),
    )
    
    if not squad_client.verify_webhook_signature(body_bytes, signature):
        logger.warning("VA webhook signature verification failed")
        raise HTTPException(status_code=401, detail="Invalid signature")

    try:
        payload = json.loads(body_bytes)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    tx_ref = payload.get("transaction_reference", "")
    va_number = payload.get("virtual_account_number", "")
    amount = payload.get("principal_amount", "0")
    customer_id = payload.get("customer_identifier", "")

    logger.info(
        f"VA webhook: ref={tx_ref}, va={va_number}, amount={amount}, customer={customer_id}"
    )

    db = SessionLocal()
    try:
        log_event(
            db=db,
            cycle_id=None,
            event_type="WEBHOOK_RECEIVED",
            entity_type="VIRTUAL_ACCOUNT",
            entity_id=va_number,
            details={
                "transaction_reference": tx_ref,
                "virtual_account_number": va_number,
                "principal_amount": amount,
                "settled_amount": payload.get("settled_amount"),
                "customer_identifier": customer_id,
                "sender_name": payload.get("sender_name"),
                "remarks": payload.get("remarks"),
            },
            severity="INFO",
        )
    except Exception as e:
        logger.error(f"Error processing VA webhook: {e}")
        db.rollback()
    finally:
        db.close()

    return {
        "response_code": 200,
        "transaction_reference": tx_ref,
        "response_description": "Success",
    }
