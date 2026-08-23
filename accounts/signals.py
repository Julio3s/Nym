from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings

from expenses.models import Category


# Catégories dépenses et revenus proposées par défaut à chaque nouvel utilisateur.
DEFAULT_CATEGORIES = {
    'depense': ['alimentation', 'transport', 'logement', 'loisirs', 'sante', 'education', 'shopping', 'autres'],
    'revenu': ['salaire', 'freelance', 'investissement', 'vente', 'autres'],
}


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def seed_default_categories(sender, instance, created, **kwargs):
    """Crée les catégories par défaut pour un utilisateur qui vient de s'inscrire.

    Résilient et idempotent : ne crée rien si l'utilisateur possède déjà des
    catégories (utile pour la migration d'utilisateurs existants).
    """
    if not created:
        return

    categories = Category.objects.filter(user=instance)
    if categories.exists():
        return

    Category.objects.bulk_create([
        Category(user=instance, name=name, type=type_)
        for type_, names in DEFAULT_CATEGORIES.items()
        for name in names
    ])