from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Expense, Category, RevenueSource
from .serializers import ExpenseSerializer, CategorySerializer, RevenueSourceSerializer


class IsOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        return getattr(obj, 'user', None) == request.user


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

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