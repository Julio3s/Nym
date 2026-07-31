from django.urls import path
from .views import SummaryView, ByCategoryView, TimelineView, ChatView

urlpatterns = [
    path('dashboard/summary/', SummaryView.as_view(), name='dashboard-summary'),
    path('dashboard/by-category/', ByCategoryView.as_view(), name='dashboard-by-category'),
    path('dashboard/timeline/', TimelineView.as_view(), name='dashboard-timeline'),
    path('chat/', ChatView.as_view(), name='chat'),
]