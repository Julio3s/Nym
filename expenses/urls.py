from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, RevenueSourceViewSet, ExpenseViewSet

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('revenue-sources', RevenueSourceViewSet, basename='revenue-source')
router.register('expenses', ExpenseViewSet, basename='expense')

urlpatterns = [
    path('', include(router.urls)),
]