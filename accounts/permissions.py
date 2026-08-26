from rest_framework import permissions


DATABASE_MANAGER_EMAIL = 'julios@admin.com'


class IsDatabaseManager(permissions.BasePermission):
    """Autorise uniquement le compte gestionnaire configuré et superuser."""

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and user.is_superuser
            and user.email.casefold() == DATABASE_MANAGER_EMAIL
        )