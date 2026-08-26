from django.db import transaction
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from expenses.models import Expense
from .models import Invoice, InvoiceType
from .serializers import InvoiceSerializer, InvoiceTypeSerializer


class OwnerViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)


class InvoiceTypeViewSet(OwnerViewSet):
    queryset = InvoiceType.objects.all()
    serializer_class = InvoiceTypeSerializer
    search_fields = ['name']


class InvoiceViewSet(OwnerViewSet):
    queryset = Invoice.objects.select_related('invoice_type')
    serializer_class = InvoiceSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'invoice_type']
    search_fields = ['title', 'description', 'invoice_type__name']
    ordering_fields = ['issue_date', 'due_date', 'amount', 'status', 'created_at']
    ordering = ['status', '-issue_date']

    @action(detail=True, methods=['post'])
    def pay(self, request, pk=None):
        invoice = self.get_object()
        if invoice.status == Invoice.STATUS_UNPAID:
            with transaction.atomic():
                expense = Expense.objects.create(
                    user=request.user, type='depense', montant=invoice.amount,
                    categorie=f'Facture - {invoice.invoice_type.name}',
                    description=invoice.description or invoice.title,
                    date=timezone.now().date(),
                )
                invoice.status = Invoice.STATUS_PAID
                invoice.paid_at = timezone.now()
                invoice.expense = expense
                invoice.save(update_fields=['status', 'paid_at', 'expense'])
        return Response(self.get_serializer(invoice).data)
