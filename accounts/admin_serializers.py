from rest_framework import serializers

from .models import User


class AdminUserSerializer(serializers.ModelSerializer):
    total_transactions = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'nom', 'prenom', 'date_joined',
            'is_active', 'is_staff', 'is_superuser', 'total_transactions',
        )
        read_only_fields = (
            'id', 'username', 'email', 'nom', 'prenom', 'date_joined',
            'is_staff', 'is_superuser', 'total_transactions',
        )