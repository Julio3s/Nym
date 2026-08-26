from django.conf import settings
from django.db import models


class Subscription(models.Model):
    ACTIVE = 'active'
    CANCELLED = 'cancelled'
    STATUS_CHOICES = [(ACTIVE, 'Actif'), (CANCELLED, 'Résilié')]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='subscriptions')
    name = models.CharField(max_length=160)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    billing_day = models.PositiveSmallIntegerField(default=1)
    started_at = models.DateField()
    cancelled_at = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=ACTIVE)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['status', 'name']

    def __str__(self):
        return f'{self.name} - {self.price}'


class SubscriptionCharge(models.Model):
    subscription = models.ForeignKey(Subscription, on_delete=models.CASCADE, related_name='charges')
    billing_period = models.DateField()
    charged_at = models.DateTimeField(auto_now_add=True)
    expense = models.OneToOneField('expenses.Expense', on_delete=models.SET_NULL, null=True, blank=True, related_name='subscription_charge')

    class Meta:
        ordering = ['-billing_period']
        constraints = [models.UniqueConstraint(fields=['subscription', 'billing_period'], name='unique_subscription_period')]

    def __str__(self):
        return f'{self.subscription.name} - {self.billing_period:%Y-%m}'
