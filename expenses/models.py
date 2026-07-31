from django.db import models
from django.conf import settings


class Expense(models.Model):
    """Modèle de transaction (dépense ou revenu)."""
    CATEGORIES = [
        ('alimentation', 'Alimentation'),
        ('transport', 'Transport'),
        ('logement', 'Logement'),
        ('loisirs', 'Loisirs'),
        ('sante', 'Santé'),
        ('education', 'Éducation'),
        ('shopping', 'Shopping'),
        ('salaire', 'Salaire'),
        ('freelance', 'Freelance'),
        ('investissement', 'Investissement'),
        ('vente', 'Vente'),
        ('autres', 'Autres'),
    ]

    TYPES = [
        ('depense', 'Dépense'),
        ('revenu', 'Revenu'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='expenses',
        verbose_name='Utilisateur',
    )
    type = models.CharField(
        max_length=10,
        choices=TYPES,
        default='depense',
        verbose_name='Type',
    )
    montant = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Montant',
    )
    categorie = models.CharField(
        max_length=20,
        choices=CATEGORIES,
        verbose_name='Catégorie',
    )
    description = models.TextField(
        blank=True,
        verbose_name='Description',
    )
    date = models.DateField(
        verbose_name='Date',
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Créé le',
    )

    class Meta:
        verbose_name = 'Transaction'
        verbose_name_plural = 'Transactions'
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.get_type_display()} - {self.categorie} - {self.montant}€ ({self.date})"