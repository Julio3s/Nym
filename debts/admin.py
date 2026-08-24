from django.contrib import admin

from .models import Debt


@admin.register(Debt)
class DebtAdmin(admin.ModelAdmin):
    list_display = ('creditor', 'montant_restant', 'date_echeance', 'statut', 'user')
    list_filter = ('statut', 'date_echeance')
    search_fields = ('creditor', 'description', 'user__email')
