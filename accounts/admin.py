from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'username', 'prénom', 'nom', 'is_staff', 'date_joined')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'pays')
    search_fields = ('email', 'username', 'prenom', 'nom', 'telephone')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Profil', {'fields': ('nom', 'prenom', 'date_naissance', 'telephone', 'adresse', 'ville', 'pays')}),
    )
    ordering = ('-date_joined',)

    @admin.display(description='Prénom')
    def prénom(self, obj):
        return obj.prenom
