import csv

from django.http import HttpResponse
from django_filters import rest_framework as filters
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Expense, Category, RevenueSource
from .serializers import ExpenseSerializer, CategorySerializer, RevenueSourceSerializer


class IsOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        return getattr(obj, 'user', None) == request.user


class ExpenseFilter(filters.FilterSet):
    """Filtres exposés sur /api/expenses/."""

    date_debut = filters.DateFilter(field_name='date', lookup_expr='gte')
    date_fin = filters.DateFilter(field_name='date', lookup_expr='lte')
    categorie = filters.CharFilter(lookup_expr='iexact')

    class Meta:
        model = Expense
        fields = ['type', 'categorie', 'date', 'date_debut', 'date_fin']


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        qs = Category.objects.filter(user=self.request.user)
        type_ = self.request.query_params.get('type')
        if type_ in ('depense', 'revenu'):
            qs = qs.filter(type=type_)
        return qs

    @action(detail=False, methods=['get'])
    def types(self, request):
        return Response([
            {'value': 'depense', 'label': 'Dépense'},
            {'value': 'revenu', 'label': 'Revenu'},
        ])


class RevenueSourceViewSet(viewsets.ModelViewSet):
    serializer_class = RevenueSourceSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return RevenueSource.objects.filter(user=self.request.user)


class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    filterset_class = ExpenseFilter
    search_fields = ['description', 'categorie', 'category__name', 'revenue_source__name']
    ordering_fields = ['date', 'montant', 'created_at']
    ordering = ['-date', '-created_at']

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user).select_related('category', 'revenue_source')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def by_type(self, request):
        t = request.query_params.get('type')
        qs = self.get_queryset()
        if t in ['depense', 'revenu']:
            qs = qs.filter(type=t)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def export(self, request):
        """Export CSV des transactions filtrées (respecte les filtres actifs)."""
        qs = self.filter_queryset(self.get_queryset())

        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = 'attachment; filename="transactions.csv"'
        response.write('\ufeff')  # BOM pour Excel

        writer = csv.writer(response, delimiter=';')
        writer.writerow(['Date', 'Type', 'Catégorie', 'Source de revenu', 'Montant (FCFA)', 'Description'])
        for e in qs:
            writer.writerow([
                e.date.isoformat(),
                e.get_type_display(),
                e.category.name if e.category else (e.categorie or ''),
                e.revenue_source.name if e.revenue_source else '',
                f'{e.montant:.2f}',
                e.description,
            ])

        return response