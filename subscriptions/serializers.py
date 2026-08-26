from decimal import Decimal
from rest_framework import serializers
from .models import Subscription, SubscriptionCharge


class SubscriptionChargeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionCharge
        fields = ['id', 'billing_period', 'charged_at', 'expense']


class SubscriptionSerializer(serializers.ModelSerializer):
    charges = SubscriptionChargeSerializer(many=True, read_only=True)

    class Meta:
        model = Subscription
        fields = ['id', 'name', 'price', 'billing_day', 'started_at', 'cancelled_at', 'status', 'description', 'charges', 'created_at']
        read_only_fields = ['id', 'status', 'cancelled_at', 'charges', 'created_at']

    def validate_price(self, value):
        if value <= Decimal('0'):
            raise serializers.ValidationError('Le prix fixe doit être supérieur à zéro.')
        return value

    def validate_billing_day(self, value):
        if value < 1 or value > 28:
            raise serializers.ValidationError('Le jour doit être compris entre 1 et 28.')
        return value

    def create(self, validated_data):
        return Subscription.objects.create(user=self.context['request'].user, **validated_data)
