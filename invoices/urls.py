from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import InvoiceTypeViewSet, InvoiceViewSet

router = DefaultRouter()
router.register('invoice-types', InvoiceTypeViewSet, basename='invoice-type')
router.register('invoices', InvoiceViewSet, basename='invoice')
urlpatterns = [path('', include(router.urls))]
