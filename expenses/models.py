from django.db import models
from django.conf import settings


class Category(models.Model):
    """Catégorie personnalisable par utilisateur."""
    TYPES = [
        ('depense', 'Dépense'),
        ('revenu', 'Revenu'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='categories',
        verbose_name='Utilisateur',
    )
    name = models.CharField(max_length=50, verbose_name='Nom')
    type = models.CharField(max_length=10, choices=TYPES, verbose_name='Type')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Catégorie'
        verbose_name_plural = 'Catégories'
        unique_together = ('user', 'name', 'type')
        ordering = ['type', 'name']

    def __str__(self):
        return f"{self.get_type_display()} - {self.name}"


class RevenueSource(models.Model):
    """Source de revenu personnalisable par utilisateur."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='revenue_sources',
        verbose_name='Utilisateur',
    )
    name = models.CharField(max_length=100, verbose_name='Nom de la source')
    default_amount = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        verbose_name='Montant par défaut'
    )
    description = models.TextField(blank=True, verbose_name='Description')
    is_active = models.BooleanField(default=True, verbose_name='Actif')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Source de revenu'
        verbose_name_plural = 'Sources de revenus'
        unique_together = ('user', 'name')
        ordering = ['name']

    def __str__(self):
        return self.name


class Expense(models.Model):
    """Modèle de transaction (dépense ou revenu)."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='expenses',
        verbose_name='Utilisateur',
    )
    type = models.CharField(
        max_length=10,
        choices=[('depense', 'Dépense'), ('revenu', 'Revenu')],
        default='depense',
        verbose_name='Type',
    )
    montant = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Montant',
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='expenses',
        verbose_name='Catégorie',
    )
    categorie = models.CharField(
        max_length=50,
        blank=True,
        verbose_name='Catégorie (ancien)',
        help_text='Ancien champ, migration en cours',
    )
    revenue_source = models.ForeignKey(
        RevenueSource,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='expenses',
        verbose_name='Source de revenu',
    )
    description = models.TextField(blank=True, verbose_name='Description')
    date = models.DateField(verbose_name='Date')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Créé le')

    class Meta:
        verbose_name = 'Transaction'
        verbose_name_plural = 'Transactions'
        ordering = ['-date', '-created_at']

    def __str__(self):
        cat = self.category.name if self.category else self.categorie or 'Sans catégorie'
        return f"{self.get_type_display()} - {cat} - {self.montant}€ ({self.date})"