from django.conf import settings
from django.db import models


class InvoiceType(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='invoice_types')
    name = models.CharField(max_length=80)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        unique_together = ('user', 'name')

    def __str__(self):
        return self.name


class Invoice(models.Model):
    STATUS_UNPAID = 'unpaid'
    STATUS_PAID = 'paid'
    STATUS_CHOICES = [(STATUS_UNPAID, 'Non payée'), (STATUS_PAID, 'Payée')]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='invoices')
    invoice_type = models.ForeignKey(InvoiceType, on_delete=models.PROTECT, related_name='invoices')
    title = models.CharField(max_length=160)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    issue_date = models.DateField()
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_UNPAID)
    paid_at = models.DateTimeField(null=True, blank=True)
    description = models.TextField(blank=True)
    expense = models.OneToOneField('expenses.Expense', on_delete=models.SET_NULL, null=True, blank=True, related_name='invoice_payment')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['status', '-issue_date', '-created_at']

    def __str__(self):
        return f'{self.title} - {self.amount}'
