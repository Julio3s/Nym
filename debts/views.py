from django.db import transaction
from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from expenses.models import Expense

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
        if debt.statut != Debt.STATUS_PAID:
            with transaction.atomic():
                amount = debt.montant_restant
                repayment_description = f'Dette remboursée auprès de {debt.creditor}'
                if debt.description:
                    repayment_description += f' - {debt.description}'
                Expense.objects.create(
                    user=request.user,
                    type='depense',
                    montant=amount,
                    categorie='Remboursement dette',
                    description=repayment_description,
                    date=timezone.now().date(),
                )
                debt.montant_restant = 0
                debt.statut = Debt.STATUS_PAID
                debt.save(update_fields=['montant_restant', 'statut', 'updated_at'])
        return Response(self.get_serializer(debt).data)
