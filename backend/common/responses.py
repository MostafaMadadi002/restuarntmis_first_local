from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone

def api_response(data=None, message: str = "", meta: dict = None, status_code: int = status.HTTP_200_OK):
    """
    Standard successful API response helper.
    Format:
    {
      "success": true,
      "data": ...,
      "meta": { "timestamp": ..., ... }
    }
    """
    meta_payload = {
        "timestamp": timezone.now().isoformat(),
    }
    if message:
        meta_payload["message"] = message
    if meta:
        meta_payload.update(meta)

    return Response({
        "success": True,
        "data": data if data is not None else {},
        "meta": meta_payload
    }, status=status_code)
