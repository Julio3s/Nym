# Mny — Frontend (React + TypeScript + Vite)

Application de gestion de dépenses / revenus / budgets.

## Lancer en local

```bash
npm install
npm run dev      # http://localhost:5173
```

## Scripts

| Commande          | Description                                    |
| ----------------- | ---------------------------------------------- |
| `npm run dev`     | Serveur de dev Vite (HMR)                      |
| `npm run build`   | Vérification TypeScript + build de production  |
| `npm run lint`    | Linting Oxlint                                 |
| `npm run preview` | Prévisualisation du build                      |

## Configuration

- L'URL de l'API est lue dans `VITE_API_URL` (`.env.local`), défaut :
  `http://localhost:8000/api`.
- Exemple : `VITE_API_URL=https://mny-backend.onrender.com/api`

## Dossier source

```
src/
├── components/   Composants UI réutilisables (Layout, ExpenseForm, AIChat…)
├── context/      AuthContext (JWT)
├── hooks/        useDashboard, useTheme (clair/sombre persistant)
├── pages/        Écrans (Dashboard, Transactions, Budgets, Profil…)
├── services/     Clients API typés (axios)
└── styles/       Variables de thème + styles globaux
```
