from django.contrib import admin
from .models import Invoice, InvoiceType

admin.site.register(InvoiceType)
admin.site.register(Invoice)
