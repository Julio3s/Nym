from rest_framework import serializers
from .models import Expense, Category, RevenueSource


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'type', 'created_at']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class RevenueSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = RevenueSource
        fields = ['id', 'name', 'default_amount', 'description', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ExpenseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    revenue_source_name = serializers.CharField(source='revenue_source.name', read_only=True)

    class Meta:
        model = Expense
        fields = ['id', 'type', 'montant', 'category', 'categorie', 'revenue_source',
                  'description', 'date', 'created_at', 'category_name', 'revenue_source_name']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)