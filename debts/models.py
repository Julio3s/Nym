from django.conf import settings
from django.db import models


class Debt(models.Model):
    STATUS_OPEN = 'ouverte'
    STATUS_PAID = 'payee'
    STATUS_CHOICES = [
        (STATUS_OPEN, 'À payer'),
        (STATUS_PAID, 'Payée'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='debts',
        verbose_name='Utilisateur',
    )
    creditor = models.CharField(max_length=120, verbose_name='Créancier')
    montant_initial = models.DecimalField(max_digits=12, decimal_places=2, verbose_name='Montant initial')
    montant_restant = models.DecimalField(max_digits=12, decimal_places=2, verbose_name='Montant restant')
    date_echeance = models.DateField(null=True, blank=True, verbose_name='Date d échéance')
    description = models.TextField(blank=True, verbose_name='Description')
    statut = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_OPEN, verbose_name='Statut')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Créée le')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Modifiée le')

    class Meta:
        verbose_name = 'Dette'
        verbose_name_plural = 'Dettes'
        ordering = ['statut', 'date_echeance', '-created_at']

    def __str__(self):
        return f'{self.creditor} - {self.montant_restant} FCFA'
