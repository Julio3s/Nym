from decimal import Decimal

from rest_framework import serializers

from .models import Debt


class DebtSerializer(serializers.ModelSerializer):
    class Meta:
        model = Debt
        fields = [
            'id', 'creditor', 'montant_initial', 'montant_restant',
            'date_echeance', 'description', 'statut', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'statut', 'created_at', 'updated_at']

    def validate(self, attrs):
        initial = attrs.get('montant_initial', getattr(self.instance, 'montant_initial', None))
        remaining = attrs.get('montant_restant', getattr(self.instance, 'montant_restant', None))

        if initial is not None and initial <= Decimal('0'):
            raise serializers.ValidationError({'montant_initial': 'Le montant doit être supérieur à zéro.'})
        if remaining is not None and remaining < Decimal('0'):
            raise serializers.ValidationError({'montant_restant': 'Le montant restant ne peut pas être négatif.'})
        if initial is not None and remaining is not None and remaining > initial:
            raise serializers.ValidationError({'montant_restant': 'Le montant restant ne peut pas dépasser le montant initial.'})
        return attrs

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        result = super().update(instance, validated_data)
        if result.montant_restant == 0:
            result.statut = Debt.STATUS_PAID
            result.save(update_fields=['statut', 'updated_at'])
        elif result.statut == Debt.STATUS_PAID:
            result.statut = Debt.STATUS_OPEN
            result.save(update_fields=['statut', 'updated_at'])
        return result
