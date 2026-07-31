from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    """Vérifie que l'utilisateur est le propriétaire de la dépense."""

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user