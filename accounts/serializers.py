from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'nom', 'prenom')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )
        if 'nom' in validated_data:
            user.nom = validated_data['nom']
        if 'prenom' in validated_data:
            user.prenom = validated_data['prenom']
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'date_joined',
            'nom', 'prenom', 'date_naissance', 'telephone',
            'adresse', 'ville', 'pays',
        )