from apps.tables.models import TableSession, TableSessionStatus

class GuestSessionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        guest_token = request.headers.get('X-Guest-Token') or request.META.get('HTTP_X_GUEST_TOKEN')
        request.guest_session = None

        if guest_token:
            try:
                session = TableSession.objects.filter(
                    session_uuid=guest_token,
                    status=TableSessionStatus.ACTIVE
                ).select_related('table', 'restaurant').first()
                if session:
                    request.guest_session = session
            except Exception:
                request.guest_session = None

        return self.get_response(request)
