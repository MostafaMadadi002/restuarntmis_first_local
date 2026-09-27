from rest_framework import serializers
from apps.crm.models import Customer, Feedback

class CustomerSerializer(serializers.ModelSerializer):
    loyalty_points = serializers.SerializerMethodField()
    loyalty_tier = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = [
            'id', 'restaurant', 'name', 'phone', 'email', 'notes',
            'total_spend', 'total_visits', 'loyalty_points', 'loyalty_tier', 'created_at'
        ]

    def get_loyalty_points(self, obj):
        if hasattr(obj, 'loyalty_account'):
            return obj.loyalty_account.points
        return 0

    def get_loyalty_tier(self, obj):
        if hasattr(obj, 'loyalty_account'):
            return obj.loyalty_account.tier
        return 'BRONZE'

class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ['id', 'table_session', 'customer', 'overall_rating', 'food_rating', 'service_rating', 'comment', 'created_at']
