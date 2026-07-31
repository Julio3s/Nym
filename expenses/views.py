from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Expense
from .serializers import ExpenseSerializer
from .permissions import IsOwner


class ExpenseViewSet(viewsets.ModelViewSet):
    """CRUD complet des dépenses."""
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated, IsOwner]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['categorie', 'date']
    search_fields = ['description', 'categorie']
    ordering_fields = ['date', 'montant', 'created_at']

    def get_queryset(self):
        """Chaque user ne voit que ses propres dépenses."""
        qs = Expense.objects.filter(user=self.request.user)
        
        # Filtres personnalisés via query params
        date_debut = self.request.query_params.get('date_debut')
        date_fin = self.request.query_params.get('date_fin')
        
        if date_debut:
            qs = qs.filter(date__gte=date_debut)
        if date_fin:
            qs = qs.filter(date__lte=date_fin)
            
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)