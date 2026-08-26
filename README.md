# Mny — Gestion des dépenses, revenus & budgets

Application web de finances personnelles (français / FCFA) :

- **Backend** : Django 4.2 + Django REST Framework + JWT (SimpleJWT) + PostgreSQL
- **Frontend** : React 19 + TypeScript + Vite + Recharts
- **Assistant IA** : chat conseiller (Groq) avec actions automatiques
  (« j'ai dépensé 5 000 en transport », « crée un budget transport de 50 000 »…)

## Fonctionnalités

- 🔐 Inscription / connexion / profil (JWT) — validation forte des mots de passe
- 💸 Transactions : dépenses **et** revenus, catégories personnalisées par type
- 🏦 Sources de revenus (montants par défaut, activation/désactivation)
- 🎯 Budgets mensuels par catégorie + barres de progression + alerte ≥ 80 %
- 📊 Dashboard : solde, résumé du jour/mois, graphiques (donut + évolution)
- 🤖 Assistant IA : conseils personnalisés + ajout de données sans quitter le chat
- 📥 Export CSV des transactions (respecte les filtres actifs)
- 🧾 Factures : types personnalisés, statut payée/non payée, paiement intégré au solde et historique filtrable
- 🔁 Abonnements : prix mensuel fixe, prélèvements idempotents et résiliation sans perte d'historique
- 🌗 Thème clair / sombre persistant
- 🎨 Design moderne : sticker-rain animé, responsive, FCFA partout

## Architecture

```
config/        Projet Django (settings, urls)
accounts/      User custom + auth (register, me, profile, change-password)
expenses/      Expense, Category, RevenueSource + API CRUD/export CSV
budgets/       Budget mensuel + endpoint de progression
dashboard/     Résumé, répartition par catégorie, évolution + chat IA
frontend/      App React (Vite) — voir frontend/README.md
```

## Démarrage local (sans Docker)

### 1. Backend

```bash
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate  # Linux/macOS

pip install -r requirements.txt
cp .env.example .env          # puis ajustez SECRET_KEY / DB_*

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver    # http://localhost:8000
```

> Par défaut `DB_ENGINE=django.db.backends.sqlite3` : zéro configuration.
> Pour PostgreSQL : renseignez `DATABASE_URL=postgres://...` dans `.env`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

Les catégories par défaut (alimentation, transport, logement, salaire, freelance…)
sont créées automatiquement à la création de chaque compte.

## API (extrait)

| Méthode | URL                                     | Description                           |
| ------- | --------------------------------------- | ------------------------------------- |
| POST    | `/api/auth/register/`                    | Inscription (+ tokens JWT)            |
| POST    | `/api/auth/login/`                       | Connexion (JWT)                       |
| POST    | `/api/auth/refresh/`                     | Rafraîchir le token                   |
| GET/PUT | `/api/auth/me/`, `/api/auth/profile/`    | Profil                                |
| GET/POST| `/api/expenses/` …                       | CRUD transactions + filtres           |
| GET     | `/api/expenses/export/`                  | Export CSV (avec filtres actifs)       |
| GET/POST| `/api/categories/`, `/api/revenue-sources/` | Catégories & sources                |
| GET/POST| `/api/budgets/`                          | CRUD budgets                          |
| GET     | `/api/budgets/progression/`              | % atteint par budget                  |
| GET     | `/api/dashboard/summary/`                | Résumé jour/mois + totaux + solde      |
| GET     | `/api/dashboard/by-category/`            | Répartition par catégorie (mois/type)  |
| GET     | `/api/dashboard/timeline/`               | Évolution mensuelle                    |
| POST    | `/api/chat/`                             | Assistant IA (actions automatiques)    |
| GET/POST| `/api/invoices/`, `/api/invoice-types/`    | Factures et types personnalisés        |
| POST    | `/api/invoices/:id/pay/`                  | Marquer une facture payée               |
| GET/POST| `/api/subscriptions/`                     | Abonnements mensuels                    |
| POST    | `/api/subscriptions/:id/cancel/`          | Résilier un abonnement                  |

Toutes les routes `api/*` requièrent le header : `Authorization: Bearer <access>`
(sauf register/login/refresh).

## Configuration recommandée (production)

Voir `.env.example` et `render.yaml` :

- `SECRET_KEY` : générée automatiquement côté Render
- `DEBUG=false`
- `ALLOWED_HOSTS` : domaines de production
- `DATABASE_URL` : connexion PostgreSQL managée
- `GROQ_API_KEY` : clé optionnelle pour l'assistant IA
- Frontend : `VITE_API_URL` pointe vers l'URL du backend

## Tests

```bash
python manage.py test             # backend
cd frontend && npm run build      # type-check + build
```