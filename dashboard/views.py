from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth, Coalesce
from django.utils import timezone
from datetime import timedelta, date
import re
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from decouple import config
from expenses.models import Expense, Category, RevenueSource
from budgets.models import Budget


class ChatView(APIView):
    """Assistant IA avec actions automatiques."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        message = request.data.get('message', '').lower()
        historique = request.data.get('historique', [])
        user = request.user
        today = timezone.now().date()
        start_of_month = today.replace(day=1)

        # Contexte utilisateur
        depenses_mois = float(Expense.objects.filter(
            user=user, date__gte=start_of_month, type='depense'
        ).aggregate(total=Sum('montant'))['total'] or 0)
        revenus_mois = float(Expense.objects.filter(
            user=user, date__gte=start_of_month, type='revenu'
        ).aggregate(total=Sum('montant'))['total'] or 0)
        solde = revenus_mois - depenses_mois

        # Détection d'actions par mots-clés (plus fiable que JSON)
        action_result = self._detect_action(message, user)
        if action_result:
            return action_result

        # Si pas d'action, réponse normale
        system_prompt = f"""Tu es un conseiller financier qui analyse les dépenses et donne des conseils.
Utilisateur: {user.get_full_name() or user.email}
Dépenses du mois: {depenses_mois:,.0f} FCFA
Revenus du mois: {revenus_mois:,.0f} FCFA
Solde: {solde:,.0f} FCFA
Réponds en français, max 150 mots, sois amical et concret."""

        messages = [{"role": "system", "content": system_prompt}]
        for msg in historique[-6:]:
            messages.append({"role": msg["role"], "content": msg["content"]})
        messages.append({"role": "user", "content": request.data.get('message', '')})

        try:
            groq_key = config('GROQ_API_KEY', default='')
            if not groq_key:
                return Response({
                    'response': "La clé API GROQ n'est pas configurée. Veuillez contacter l'administrateur.",
                    'action': None
                }, status=500)

            resp = requests.post(
                'https://api.groq.com/openai/v1/chat/completions',
                json={"model": "llama-3.3-70b-versatile", "messages": messages, "temperature": 0.7, "max_tokens": 500},
                headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {groq_key}'},
                timeout=30,
            )
            resp.raise_for_status()
            content = resp.json()['choices'][0]['message']['content']
            return Response({'response': content, 'action': None})
        except requests.exceptions.Timeout:
            return Response({'response': "Désolé, le service met trop de temps à répondre. Veuillez réessayer.", 'action': None}, status=500)
        except requests.exceptions.RequestException as e:
            return Response({'response': f"Erreur de connexion: {str(e)}", 'action': None}, status=500)
        except Exception as e:
            return Response({'response': f"Erreur: {str(e)}", 'action': None}, status=500)

    def _resolve_category(self, user, name, type_):
        """Retourne (category, nom_nettoyé) — crée la catégorie si besoin."""
        name = (name or '').strip()
        if not name:
            return None, ''
        category, _ = Category.objects.get_or_create(
            user=user, name=name, type=type_,
            defaults={'name': name, 'type': type_},
        )
        return category, category.name

    def _detect_action(self, msg, user):
        """Détecte les actions par mots-clés et les exécute."""
        msg_lower = msg.lower()
        today = date.today()

        # --- CRÉER BUDGET ---
        if 'budget' in msg_lower and any(
            kw in msg_lower
            for kw in ('crée', 'creer', 'ajoute', 'fixe', 'met', 'nouveau', 'budget de')
        ):
            categories = list(Category.objects.filter(user=user, type='depense').values_list('name', flat=True))
            if not categories:
                categories = ['alimentation', 'transport', 'logement', 'loisirs', 'sante', 'education', 'shopping', 'autres']
            categorie = next((cat for cat in categories if cat.lower() in msg_lower), None)
            if not categorie:
                return None

            # Extraire le montant
            montants = re.findall(r'(\d+[\s]?\d*)', msg_lower)
            montant = None
            for m in montants:
                val = float(m.replace(' ', ''))
                if val > 0:
                    montant = val
                    break

            if montant and categorie:
                mois = today.replace(day=1)
                existing = Budget.objects.filter(user=user, categorie=categorie, mois=mois).first()
                if existing:
                    existing.montant = montant
                    existing.save(update_fields=['montant'])
                else:
                    Budget.objects.create(user=user, categorie=categorie, montant=montant, mois=mois)
                return Response({
                    'response': f"✅ Budget '{categorie}' de {montant:,.0f} FCFA créé avec succès !",
                    'action': {'type': 'budget_created', 'categorie': categorie, 'montant': montant}
                })
            elif categorie:
                return Response({
                    'response': f"Quel montant voulez-vous pour le budget '{categorie}' ?",
                    'action': None
                })

        # --- AJOUTER DÉPENSE ---
        if 'dépense' in msg_lower or 'depense' in msg_lower or 'dépensé' in msg_lower or 'acheté' in msg_lower or 'payé' in msg_lower or 'payer' in msg_lower:
            montants = re.findall(r'(\d+[\s]?\d*)', msg_lower)
            montant = None
            for m in montants:
                val = float(m.replace(' ', ''))
                if 0 < val < 100000000:
                    montant = val
                    break

            categories = list(Category.objects.filter(user=user, type='depense').values_list('name', flat=True))
            if not categories:
                categories = ['alimentation', 'transport', 'logement', 'loisirs', 'sante', 'education', 'shopping', 'autres']
            categorie = 'autres'
            for cat in categories:
                if cat.lower() in msg_lower:
                    categorie = cat
                    break

            if montant:
                category, cat_name = self._resolve_category(user, categorie, 'depense')
                expense = Expense.objects.create(
                    user=user, type='depense', montant=montant,
                    category=category, categorie=cat_name, description=msg, date=today
                )
                return Response({
                    'response': f"✅ Dépense de {montant:,.0f} FCFA en '{cat_name}' ajoutée !",
                    'action': {'type': 'expense_created', 'id': expense.id}
                })

        # --- AJOUTER REVENU ---
        if 'revenu' in msg_lower or 'salaire' in msg_lower or 'gain' in msg_lower:
            montants = re.findall(r'(\d+[\s]?\d*)', msg_lower)
            montant = None
            for m in montants:
                val = float(m.replace(' ', ''))
                if 0 < val < 100000000:
                    montant = val
                    break

            revenue_sources = list(RevenueSource.objects.filter(user=user, is_active=True).values_list('name', flat=True))
            if not revenue_sources:
                revenue_sources = ['salaire', 'freelance', 'investissement', 'vente', 'autres']
            source = 'autres'
            for rs in revenue_sources:
                if rs.lower() in msg_lower:
                    source = rs
                    break

            if 'salaire' in msg_lower:
                source = 'salaire'

            if montant:
                category, cat_name = self._resolve_category(user, source, 'revenu')
                revenue = Expense.objects.create(
                    user=user, type='revenu', montant=montant,
                    category=category, categorie=cat_name, description=msg, date=today
                )
                return Response({
                    'response': f"✅ Revenu de {montant:,.0f} FCFA en '{cat_name}' ajouté !",
                    'action': {'type': 'revenue_created', 'id': revenue.id}
                })

        return None


def _parse_month(day):
    """(début, fin) du mois contenant `day` (ou `day` ramené au 1er du mois)."""
    start = day.replace(day=1)
    if start.month == 12:
        end = start.replace(year=start.year + 1, month=1)
    else:
        end = start.replace(month=start.month + 1)
    return start, end


class SummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        start_of_month, _ = _parse_month(today)
        d_today = Expense.objects.filter(user=request.user, date=today, type='depense').aggregate(total=Sum('montant'), count=Count('id'))
        r_today = Expense.objects.filter(user=request.user, date=today, type='revenu').aggregate(total=Sum('montant'), count=Count('id'))
        d_month = Expense.objects.filter(user=request.user, date__gte=start_of_month, type='depense').aggregate(total=Sum('montant'), count=Count('id'))
        r_month = Expense.objects.filter(user=request.user, date__gte=start_of_month, type='revenu').aggregate(total=Sum('montant'), count=Count('id'))
        total_d = float(Expense.objects.filter(user=request.user, type='depense').aggregate(total=Sum('montant'))['total'] or 0)
        total_r = float(Expense.objects.filter(user=request.user, type='revenu').aggregate(total=Sum('montant'))['total'] or 0)
        return Response({
            'today': {'depenses': float(d_today['total'] or 0), 'revenus': float(r_today['total'] or 0), 'count': (d_today['count'] or 0) + (r_today['count'] or 0)},
            'month': {'depenses': float(d_month['total'] or 0), 'revenus': float(r_month['total'] or 0), 'count': (d_month['count'] or 0) + (r_month['count'] or 0)},
            'solde': total_r - total_d,
            'totaux': {'depenses': total_d, 'revenus': total_r},
        })


class ByCategoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        start, _ = _parse_month(today)
        m = request.query_params.get('mois')
        if m:
            try:
                y, mo = map(int, m.split('-'))
                start = today.replace(year=y, month=mo, day=1)
            except (ValueError, TypeError):
                pass
        start, end = _parse_month(start)
        type_ = request.query_params.get('type', 'depense')
        qs = Expense.objects.filter(user=request.user, date__gte=start, date__lt=end)
        if type_ in ('depense', 'revenu'):
            qs = qs.filter(type=type_)
        cats = (
            qs.annotate(cat_name=Coalesce('category__name', 'categorie'))
            .values('cat_name')
            .annotate(total=Sum('montant'), count=Count('id'))
            .order_by('-total')
        )
        return Response({
            'mois': start.strftime('%Y-%m'),
            'type': type_ if type_ in ('depense', 'revenu') else None,
            'categories': [
                {'categorie': c['cat_name'] or 'Sans catégorie', 'total': float(c['total']), 'count': c['count']}
                for c in cats
            ],
        })


class TimelineView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        try:
            months = min(max(int(request.query_params.get('months', 6)), 1), 24)
        except (TypeError, ValueError):
            months = 6
        start = today - timedelta(days=30 * months)
        qs = Expense.objects.filter(user=request.user, date__gte=start)
        type_ = request.query_params.get('type', 'depense')
        if type_ in ('depense', 'revenu'):
            qs = qs.filter(type=type_)
        tl = (
            qs.annotate(month=TruncMonth('date'))
            .values('month')
            .annotate(total=Sum('montant'), count=Count('id'))
            .order_by('month')
        )
        return Response([
            {'mois': e['month'].strftime('%Y-%m') if e['month'] else None, 'total': float(e['total']), 'count': e['count']}
            for e in tl
        ])