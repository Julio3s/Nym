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

    def _normalize_category(self, validated_data, instance=None):
        """Réunit le champ historique `categorie` et la FK `category`.

        Règle : si la FK `category` est absente mais qu'un nom de catégorie est
        fourni (champ `categorie`), on cherche la Category de l'utilisateur
        (même nom, même type) et on la crée au besoin, puis on remplit la FK.
        Si la FK est fournie, on synchronise le champ historique avec son nom.
        """
        type_ = validated_data.get('type', getattr(instance, 'type', 'depense'))
        user = self.context['request'].user

        category = validated_data.get('category', getattr(instance, 'category', None))
        categorie = validated_data.get('categorie') if 'categorie' in validated_data else getattr(instance, 'categorie', '')

        name = None
        if category is not None:
            name = category.name
        elif categorie:
            name = str(categorie)

        if name:
            name = name.strip()
            if not category:
                category, _ = Category.objects.get_or_create(
                    user=user, name=name, type=type_,
                    defaults={'name': name, 'type': type_},
                )
            validated_data['category'] = category
            validated_data['categorie'] = category.name

        return validated_data

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        validated_data = self._normalize_category(validated_data)

        # Pour les revenus, si une source est choisie, on affiche son nom par défaut.
        revenue_source = validated_data.get('revenue_source')
        if revenue_source is not None and not validated_data.get('categorie'):
            validated_data['categorie'] = revenue_source.name

        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data = self._normalize_category(validated_data, instance=instance)

        revenue_source = validated_data.get('revenue_source', instance.revenue_source)
        if revenue_source is not None and not validated_data.get('categorie'):
            validated_data['categorie'] = revenue_source.name

        return super().update(instance, validated_data)