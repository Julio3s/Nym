from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from django.db.models.functions import Coalesce
from django.utils import timezone
from .models import Budget
from .serializers import BudgetSerializer
from expenses.models import Expense


class BudgetViewSet(viewsets.ModelViewSet):
    """CRUD des budgets + endpoint progression."""
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def progression(self, request):
        """Dépensé vs budget par catégorie pour le mois en cours.

        Seules les *dépenses* du mois sont comptées. La jointure couvre les
        catégories personnalisées (FK `category`) et l'ancien champ libre
        (`categorie`), pour rester compatible avec les données historiques.
        """
        today = timezone.now().date()
        start_of_month = today.replace(day=1)

        if start_of_month.month == 12:
            end_of_month = start_of_month.replace(year=start_of_month.year + 1, month=1)
        else:
            end_of_month = start_of_month.replace(month=start_of_month.month + 1)

        budgets = Budget.objects.filter(user=request.user, mois=start_of_month)
        depenses = (
            Expense.objects.filter(
                user=request.user,
                type='depense',
                date__gte=start_of_month,
                date__lt=end_of_month,
            )
            .annotate(cat_name=Coalesce('category__name', 'categorie'))
            .values('cat_name')
            .annotate(depense=Sum('montant'))
        )

        depense_map = {d['cat_name']: float(d['depense']) for d in depenses}

        result = []
        for budget in budgets:
            depense = depense_map.get(budget.categorie, 0)
            budget_montant = float(budget.montant)
            pourcentage = round((depense / budget_montant) * 100, 1) if budget_montant > 0 else 0
            result.append({
                'id': budget.id,
                'categorie': budget.categorie,
                'budget': budget_montant,
                'depense': depense,
                'pourcentage_atteint': pourcentage,
                'alerte': pourcentage >= 80,
                'depasse': pourcentage > 100,
            })

        return Response(result)