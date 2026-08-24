from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Debt
from .serializers import DebtSerializer


class DebtViewSet(viewsets.ModelViewSet):
    serializer_class = DebtSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering_fields = ['date_echeance', 'montant_restant', 'created_at']
    ordering = ['statut', 'date_echeance', '-created_at']

    def get_queryset(self):
        return Debt.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def pay(self, request, pk=None):
        debt = self.get_object()
        debt.montant_restant = 0
        debt.statut = Debt.STATUS_PAID
        debt.save(update_fields=['montant_restant', 'statut', 'updated_at'])
        return Response(self.get_serializer(debt).data)
