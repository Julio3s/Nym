from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

from expenses.models import Expense

from .models import Debt


class DebtApiTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username='debt-user', email='debt@example.com', password='password123'
        )
        self.client.force_authenticate(self.user)

    def test_create_and_list_debt_for_current_user(self):
        response = self.client.post(reverse('debt-list'), {
            'creditor': 'Ami',
            'montant_initial': '50000',
            'montant_restant': '50000',
            'description': 'Rembourser avant la fin du mois',
        }, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertEqual(self.client.get(reverse('debt-list')).data['results'][0]['creditor'], 'Ami')

    def test_pay_action_closes_debt(self):
        debt = Debt.objects.create(
            user=self.user, creditor='Banque', montant_initial=100, montant_restant=100
        )
        response = self.client.post(reverse('debt-pay', args=[debt.id]))

        self.assertEqual(response.status_code, 200)
        debt.refresh_from_db()
        self.assertEqual(debt.montant_restant, 0)
        self.assertEqual(debt.statut, Debt.STATUS_PAID)
        repayment = Expense.objects.get(user=self.user)
        self.assertEqual(repayment.type, 'depense')
        self.assertEqual(repayment.montant, 100)
        self.assertIn('Banque', repayment.description)

        self.client.post(reverse('debt-pay', args=[debt.id]))
        self.assertEqual(Expense.objects.filter(user=self.user).count(), 1)
