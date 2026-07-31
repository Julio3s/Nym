from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Modèle utilisateur personnalisé avec profil complet."""
    email = models.EmailField(unique=True)
    
    # Champs de profil
    nom = models.CharField(max_length=100, verbose_name='Nom', blank=True)
    prenom = models.CharField(max_length=100, verbose_name='Prénom', blank=True)
    date_naissance = models.DateField(verbose_name='Date de naissance', null=True, blank=True)
    telephone = models.CharField(max_length=20, verbose_name='Téléphone', blank=True)
    adresse = models.CharField(max_length=255, verbose_name='Adresse', blank=True)
    ville = models.CharField(max_length=100, verbose_name='Ville', blank=True)
    pays = models.CharField(max_length=100, verbose_name='Pays', default='Bénin')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'

    def __str__(self):
        return f"{self.prenom} {self.nom}".strip() or self.email