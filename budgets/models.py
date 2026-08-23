from django.db import models
from django.conf import settings


class Budget(models.Model):
    """Modèle de budget par catégorie et par mois.

    `categorie` stocke le *nom* de la catégorie (custom ou par défaut). Aucune
    liste figée : l'utilisateur peut budgéter n'importe laquelle de ses
    catégories personnalisées.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='budgets',
        verbose_name='Utilisateur',
    )
    categorie = models.CharField(
        max_length=50,
        verbose_name='Catégorie',
    )
    montant = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Montant budget',
    )
    mois = models.DateField(
        verbose_name='Mois',
        help_text='Premier jour du mois (ex: 2026-07-01)',
    )

    class Meta:
        verbose_name = 'Budget'
        verbose_name_plural = 'Budgets'
        unique_together = ('user', 'categorie', 'mois')
        ordering = ['-mois', 'categorie']

    def __str__(self):
        return f"{self.categorie} - {self.montant} ({self.mois.strftime('%Y-%m')})"