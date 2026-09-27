import secrets
from django.core import signing
from django.conf import settings
try:
    from common.exceptions import InvalidQRError
except ImportError:
    from backend.common.exceptions import InvalidQRError

QR_SALT = "restaurant-local-qr-security-v1"

def generate_signed_qr_payload(restaurant_id: int, table_id: int, qr_version: int) -> str:
    """
    Generates a cryptographically signed, tamper-proof QR string payload.
    Contains minimal metadata: restaurant_id, table_id, qr_version, and a random nonce.
    """
    payload = {
        "r_id": restaurant_id,
        "t_id": table_id,
        "v": qr_version,
        "nonce": secrets.token_hex(4)
    }
    return signing.dumps(payload, salt=QR_SALT)

def verify_and_decode_qr_token(signed_token: str) -> dict:
    """
    Verifies signature and decodes QR token payload.
    Raises InvalidQRError if tampered or corrupt.
    """
    try:
        data = signing.loads(signed_token, salt=QR_SALT)
        return data
    except (signing.BadSignature, Exception) as e:
        raise InvalidQRError(f"Invalid QR signature or corrupted QR token: {str(e)}")
