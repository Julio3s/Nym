from django.contrib import admin

from .models import Expense, Category, RevenueSource


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'user', 'created_at')
    list_filter = ('type',)
    search_fields = ('name', 'user__email')


@admin.register(RevenueSource)
class RevenueSourceAdmin(admin.ModelAdmin):
    list_display = ('name', 'default_amount', 'is_active', 'user', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'user__email')


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('date', 'get_type_display', 'montant', 'category', 'categorie', 'revenue_source', 'user')
    list_filter = ('type', 'date', 'category')
    search_fields = ('description', 'categorie', 'category__name', 'user__email')
    raw_id_fields = ('user', 'category', 'revenue_source')
    ordering = ('-date', '-created_at')
