# Evolis - Vue d'Ensemble du Projet

## 🎯 Objectif Général

**Evolis** est une plateforme SaaS (Software as a Service) d'analyse et de sauvetage d'entreprises en difficulté financière. Elle utilise l'intelligence artificielle pour diagnostiquer les problèmes commerciaux, évaluer la santé financière des entreprises, et générer des plans de récupération stratégiques avec des ressources de formation.

## 👥 Pour Qui ?

### Utilisateurs Primaires
1. **Propriétaires/Dirigeants d'Entreprise** - PME et ETI en difficulté financière cherchant conseil
2. **Consultants en Gestion** - Professionnels accompagnant les entreprises en redressement
3. **Analystes Financiers** - Experts évaluant la santé commerciale d'organisations
4. **Investisseurs/Banquiers** - Professionnels évaluant les risques avant prêts ou investissements

### Utilisateurs Secondaires
- Équipes de direction cherchant des recommandations stratégiques
- Consultants en restructuration d'entreprises
- Professionnels du secteur financier

## 💼 Ce que le Projet Fait

### 1. **Analyse Diagnostique Automatisée**
- Collecte des données financières et commerciales via un formulaire intuitif
- Analyse par IA (Nova API d'Amazon) identifiant:
  - Les problèmes critiques (revenue decline, dette, cash flow)
  - Le niveau de risque (High, Medium, Low)
  - Les tendances de santé financière

### 2. **Plans de Récupération Personnalisés**
- Génération automatique de plans d'action en plusieurs phases
- Priorités claires et objectifs mesurables
- Recommandations stratégiques avec ROI estimé
- Suivi du progrès via "Health Score"

### 3. **Documentation Professionnelle**
- Génération de rapports PDF de haute qualité
- Graphiques et tableaux visualisant les données
- Export avec formatage automatique des grands nombres
- Documents prêts pour présentation à investisseurs/banquiers

### 4. **Ressources de Formation Éducatives**
- Lien automatique vers ressources YouTube d'apprentissage
- Correspondance intelligente entre problèmes identifiés et formations recommandées
- Couvre: gestion financière, optimisation des coûts, croissance des ventes, etc.

### 5. **Suivi Continu**
- Dashboard personnel affichant la santé financière globale
- Historique des analyses et tendances
- Graphique d'évolution du "Health Score" au fil du temps
- Notes et observations pour suivi personnalisé

## 🔧 Comment Ça Fonctionne

### Parcours Utilisateur Typique

```
1. Inscription/Connexion Firebase
   ↓
2. Remplissage du formulaire d'analyse
   (Données financières, tendances, défis)
   ↓
3. Appel API Nova (Intelligence Artificielle)
   ↓
4. Réception des recommandations IA
   (Problèmes, plan de récupération, actions)
   ↓
5. Visualisation sur le Dashboard
   (Health Score, tendances, recommandations)
   ↓
6. Export PDF du diagnostic
   ↓
7. Accès aux ressources de formation YouTube
```

## 📊 Fonctionnalités Clés

### Frontend (React)
| Fonctionnalité | Description |
|---|---|
| **Authentification** | Login/Register avec Firebase |
| **Formulaire d'Analyse** | Collecte structurée de données métier |
| **Dashboard** | Vue personnelle des analyses et tendances |
| **Résultats** | Affichage détaillé des diagnostics IA |
| **Export PDF** | Rapports professionnels formatés |
| **Ressources** | Lien vers formations mentionnées |

### Backend (Node.js/Express)
| Service | Rôle |
|---|---|
| **Auth Service** | Gère Firebase et authentification JWT |
| **Nova Service** | Appels à l'API Amazon Nova pour analyses |
| **Database** | PostgreSQL pour persistance des analyses |
| **Notification Service** | Alertes email aux utilisateurs |

### Intelligence Artificielle
- **Modèle**: Amazon Nova (Cognitive Reasoning)
- **Analyse**: Diagnostique financière et stratégique
- **Sortie**: Structures JSON avec problèmes, plans, recommandations

## 💾 Architecture Système

```
┌─────────────────────────────────────────────────────────┐
│                   EVOLIS PLATFORM                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐      ┌──────────────────┐        │
│  │   FRONTEND       │      │   BACKEND        │        │
│  │  (React/Vite)   │←──→  │  (Node/Express)  │        │
│  │                  │      │                  │        │
│  │ • Login Page     │      │ • Auth Routes    │        │
│  │ • Form Input     │      │ • Analysis API   │        │
│  │ • Dashboard      │      │ • Support API    │        │
│  │ • PDF Export     │      │                  │        │
│  └──────────────────┘      └────────┬─────────┘        │
│                                     │                   │
│                    ┌────────────────┼────────────────┐  │
│                    │                │                │  │
│                    ▼                ▼                ▼  │
│            ┌─────────────┐  ┌────────────┐  ┌─────────┐│
│            │ PostgreSQL  │  │ Nova API   │  │Firebase ││
│            │ Database    │  │ (AI Engine)│  │ Auth    ││
│            └─────────────┘  └────────────┘  └─────────┘│
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 🎨 Éléments Clés du Produit

### 1. Health Score (Score de Santé)
- Indicateur global de la santé financière (0-100)
- Calculé en base aux principaux problèmes identifiés
- Suivi dans le temps via graphique d'évolution
- Code couleur: Vert (bon) → Orange (moyen) → Rouge (critique)

### 2. Analyse de Problèmes
Chaque problème contient:
- **Titre**: Ex. "Revenue Decline", "Debt Burden"
- **Sévérité**: High, Medium, Basse
- **Impact**: Description tex de l'impact financier
- **Données**: Chiffres formatés (milliards/millions USD)

### 3. Plan de Récupération
Structure en phases avec:
- **Phase**: Étape numérotée (1, 2, 3...)
- **Focus**: Objectif principal de la phase
- **Actions**: Étapes concrètes à exécuter
- **Délai**: Timeline pour complétion

### 4. Recommandations Stratégiques
Chaque recommandation inclut:
- **Priorité**: High, Medium, Basse
- **Action**: Description détaillée de l'initiati
- **ROI**: Retour sur investi estimé
- **Formation**: Ressources YouTube liées

## 📈 Cas d'Usage

### Cas 1: Redressement d'Entreprise
> "Notre PME voit ses revenus diminuer et ne savons pas où intervenir. Evolis analyse nos données et nous propose un plan étape par étape avec formations spécialisées."

### Cas 2: Évaluation d'Investissement
> "Un banquier utilise Evolis pour évaluer rapidement les risques avant d'un prêt à une PME en difficulté."

### Cas 3: Suivi Stratégique
> "Un consultant utilise le dashboard pour suivre la progression de ses clients et ajuster les recommandations."

## 🛠️ Stack Technique

| Couche | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, jsPDF |
| **Backend** | Node.js, Express, PostgreSQL |
| **Auth** | Firebase Admin SDK |
| **IA** | Amazon Nova API |
| **Hosting** | Vercel (Frontend + API) |
| **Email** | SendGrid |

## 📊 Données Principales Collectées

### À l'Inscription
- Nom, Email, Mot de passe
- Secteur d'activité
- Taille de l'entreprise

### Dans le Formulaire d'Analyse
- Revenue (chiffre d'affaires)
- Expenses (dépenses)
- Debt (dette totale)
- Cash Flow observations
- Tendances (improving/stable/declining)
- Défis principaux
- Upload PDF optionnel

### Résultats IA
- Risk Level (évaluation)
- Main Problems (problèmes identifiés)
- Recovery Plan (plan d'action)
- Recommendations (recommandations stratégiques)
- Training Resources (formations mappées)

## 🎓 Ressources de Formation

La plateforme mappe automatiquement 10 types de formations YouTube:

1. **Gestion Financière** - Concepts comptables fondamentaux
2. **Optimisation des Coûts** - Réduction des dépenses inefficaces
3. **Croissance des Ventes** - Stratégies d'augmentation de revenue
4. **Fidélisation Client** - Retention et valeur client
5. **Stratégie Métier** - Planification long terme
6. **Cash Flow** - Gestion de la trésorerie
7. **Gestion de la Dette** - Refinancement et stratégies
8. **Opérations** - Efficacité opérationnelle
9. **Leadership** - Management et équipes
10. **Marketing** - Branding et acquisition

## 🔒 Sécurité & Confidentialité

- Authentification Firebase sécurisée
- Chiffrement des données sensibles
- Accès basé sur les rôles
- Logs d'audit pour traçabilité
- Conformité RGPD

## 📱 Qui Peut Accéder ?

1. **Utilisateur Libre**: Peut créer compte et analyser
2. **Utilisateur Premium**: Accès illimité + fonctionnalités avancées
3. **Admin**: Gestion de la plateforme + rapports

## 🚀 Vision Future

- **Mobile App**: Application iOS/Android
- **Intégrations**: Connecteurs Xero, Sage, etc.
- **Collaboration**: Partage d'analyses en équipe
- **API Ouverte**: Intégration tier-parties
- **Benchmarking**: Comparaison secteur / industrie
- **Automatisation**: Alertes basées sur seuils
- **Multilingue**: Support de 10+ langues

## 💡 Avantages Clés

✅ **Diagnostic IA Instantané** - Analyse en secondes vs semaines de consultation
✅ **Accessibilité** - Coût faible vs conseil traditionnel cher
✅ **Protection Données** - Confidentialité et sécurité garanties
✅ **Ressources Éducatives** - Formation directement liée aux besoins
✅ **Rapports Professionnels** - PDF de haute qualité prêts à présenter
✅ **Suivi Continu** - Dashboard pour progression long terme

---

**Evolis** = Empowering businesses to turnaround with AI-powered insights and actionable strategies.
