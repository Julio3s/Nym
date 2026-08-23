from django.contrib import admin

from .models import Budget


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ('categorie', 'montant', 'mois', 'user')
    list_filter = ('mois',)
    search_fields = ('categorie', 'user__email')
    raw_id_fields = ('user',)
    ordering = ('-mois', 'categorie')
