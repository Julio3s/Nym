from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),
    path('api/', include('expenses.urls')),
    path('api/', include('budgets.urls')),
    path('api/', include('debts.urls')),
    path('api/', include('dashboard.urls')),
]