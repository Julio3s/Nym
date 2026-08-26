from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db.models import Count
from budgets.models import Budget
from debts.models import Debt
from expenses.models import Category, Expense, RevenueSource
from .admin_serializers import AdminUserSerializer
from .permissions import IsDatabaseManager
from .serializers import RegisterSerializer, UserSerializer
from .models import User


class RegisterView(generics.CreateAPIView):
    """Inscription d'un nouvel utilisateur — retourne tokens JWT."""
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Générer les tokens JWT
        refresh = RefreshToken.for_user(user)

        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


class LoginView(TokenObtainPairView):
    """Connexion (retourne access + refresh tokens)."""
    permission_classes = (permissions.AllowAny,)


class MeView(generics.RetrieveAPIView):
    """Retourne les infos de l'utilisateur connecté."""
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        response.data['is_database_manager'] = IsDatabaseManager().has_permission(request, self)
        return response


class DatabaseOverviewView(APIView):
    permission_classes = [IsDatabaseManager]

    def get(self, request):
        users = User.objects.annotate(total_transactions=Count('expenses')).order_by('-date_joined')
        return Response({
            'counts': {
                'users': User.objects.count(),
                'transactions': Expense.objects.count(),
                'budgets': Budget.objects.count(),
                'debts': Debt.objects.count(),
                'categories': Category.objects.count(),
                'revenue_sources': RevenueSource.objects.count(),
            },
            'users': AdminUserSerializer(users, many=True).data,
            'transactions': list(Expense.objects.select_related('user', 'category', 'revenue_source').values(
                'id', 'user__email', 'type', 'montant', 'categorie', 'category__name',
                'revenue_source__name', 'description', 'date', 'created_at',
            )),
            'budgets': list(Budget.objects.select_related('user').values(
                'id', 'user__email', 'categorie', 'montant', 'mois',
            )),
            'debts': list(Debt.objects.select_related('user').values(
                'id', 'user__email', 'creditor', 'montant_initial', 'montant_restant',
                'date_echeance', 'statut', 'description',
            )),
            'categories': list(Category.objects.select_related('user').values(
                'id', 'user__email', 'name', 'type', 'created_at',
            )),
            'revenue_sources': list(RevenueSource.objects.select_related('user').values(
                'id', 'user__email', 'name', 'default_amount', 'description', 'is_active', 'created_at',
            )),
        })


class DatabaseUserDetailView(APIView):
    permission_classes = [IsDatabaseManager]

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'Utilisateur introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        if user == request.user:
            return Response({'detail': 'Le compte gestionnaire ne peut pas être désactivé.'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = AdminUserSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'Utilisateur introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        if user == request.user:
            return Response({'detail': 'Le compte gestionnaire ne peut pas être supprimé.'}, status=status.HTTP_400_BAD_REQUEST)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UpdateProfileView(generics.UpdateAPIView):
    """Mise à jour du profil (username, email)."""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """Changement de mot de passe (avec validation forte Django)."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        new_password2 = request.data.get('new_password2')

        if not old_password or not new_password:
            return Response(
                {'detail': 'Ancien et nouveau mot de passe requis.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if new_password2 is not None and new_password != new_password2:
            return Response(
                {'detail': 'Les deux nouveaux mots de passe ne correspondent pas.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not user.check_password(old_password):
            return Response(
                {'detail': 'Ancien mot de passe incorrect.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Applique les validateurs Django (longueur, similarité, listes communes…)
        try:
            validate_password(new_password, user=user)
        except ValidationError as errors:
            return Response(
                {'detail': ' '.join(errors.messages)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.save(update_fields=['password'])

        return Response({'detail': 'Mot de passe modifié avec succès.'})