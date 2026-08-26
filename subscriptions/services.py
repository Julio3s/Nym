from calendar import monthrange
from datetime import date
from django.db import transaction
from django.utils import timezone
from expenses.models import Expense
from .models import Subscription, SubscriptionCharge


def month_start(year, month):
    return date(year, month, 1)


def ensure_charges(subscription):
    if subscription.status != Subscription.ACTIVE:
        return
    today = timezone.localdate()
    period = month_start(subscription.started_at.year, subscription.started_at.month)
    current = month_start(today.year, today.month)
    with transaction.atomic():
        while period <= current:
            if subscription.cancelled_at is None or period < month_start(subscription.cancelled_at.year, subscription.cancelled_at.month):
                charge_date = date(period.year, period.month, subscription.billing_day)
                if charge_date > today:
                    break
                charge, created = SubscriptionCharge.objects.get_or_create(
                    subscription=subscription,
                    billing_period=period,
                )
                if created:
                    charge.expense = Expense.objects.create(
                        user=subscription.user,
                        type='depense',
                        montant=subscription.price,
                        categorie=f'Abonnement - {subscription.name}',
                        description=subscription.description or f'Prélèvement mensuel {subscription.name}',
                        date=charge_date,
                    )
                    charge.save(update_fields=['expense'])
            next_year, next_month = (period.year + 1, 1) if period.month == 12 else (period.year, period.month + 1)
            period = month_start(next_year, next_month)
