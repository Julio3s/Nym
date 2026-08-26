from decimal import Decimal
from rest_framework import serializers
from .models import Invoice, InvoiceType


class InvoiceTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceType
        fields = ['id', 'name', 'created_at']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        return InvoiceType.objects.create(user=self.context['request'].user, **validated_data)


class InvoiceSerializer(serializers.ModelSerializer):
    type_name = serializers.CharField(source='invoice_type.name', read_only=True)

    class Meta:
        model = Invoice
        fields = ['id', 'invoice_type', 'type_name', 'title', 'amount', 'issue_date', 'due_date', 'status', 'paid_at', 'description', 'expense', 'created_at']
        read_only_fields = ['id', 'status', 'paid_at', 'expense', 'created_at']

    def validate_amount(self, value):
        if value <= Decimal('0'):
            raise serializers.ValidationError('Le montant doit être supérieur à zéro.')
        return value

    def validate_invoice_type(self, value):
        if value.user != self.context['request'].user:
            raise serializers.ValidationError('Ce type de facture ne vous appartient pas.')
        return value

    def create(self, validated_data):
        return Invoice.objects.create(user=self.context['request'].user, **validated_data)
