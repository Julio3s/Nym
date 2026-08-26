from rest_framework import permissions, viewsets
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Subscription
from .serializers import SubscriptionSerializer
from .services import ensure_charges


class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = Subscription.objects.prefetch_related('charges')
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'price', 'started_at', 'status', 'created_at']
    ordering = ['status', 'name']

    def get_queryset(self):
        queryset = super().get_queryset().filter(user=self.request.user)
        for subscription in queryset.filter(status=Subscription.ACTIVE):
            ensure_charges(subscription)
        return queryset

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        subscription = self.get_object()
        subscription.status = Subscription.CANCELLED
        subscription.cancelled_at = subscription.cancelled_at or timezone.localdate()
        subscription.save(update_fields=['status', 'cancelled_at'])
        return Response(self.get_serializer(subscription).data)
