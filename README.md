# Erama - Plateforme de Mise en Relation Freelances & Missions

## 🚀 Vue d'ensemble

Erama est une plateforme moderne qui connecte les freelances avec des opportunités de missions, en utilisant Discord comme interface principale d'interaction. La plateforme combine une API REST robuste avec un bot Discord intégré pour offrir une expérience utilisateur fluide et accessible.

## 📋 Fonctionnalités principales

- **Bot Discord intégré**
  - Publication automatique des missions
  - Commandes utilisateur intuitives
  - Notifications personnalisées
  - Système de candidature intégré

- **API REST**
  - Gestion complète des missions
  - Profils freelances
  - Système de matching avancé
  - Gestion des compétences

- **Système de Cache**
  - Cache Redis pour les performances
  - Gestion optimisée des sessions
  - Rate limiting intelligent

## 🛠️ Stack Technique

- **Backend**: NestJS & TypeScript
- **Base de données**: PostgreSQL
- **Cache**: Redis
- **Discord**: discord.js
- **ORM**: TypeORM
- **Authentication**: JWT
- **Déploiement**: Docker & Railway

## 📦 Prérequis

- Node.js (v16+)
- PostgreSQL
- Redis
- Un compte Discord Developer
- Docker (optionnel)

## ⚙️ Installation

1. **Cloner le repository**
```bash
git clone <repository-url>
cd erama
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
```bash
cp .env.example .env
```

Variables requises :
```
DATABASE_URL=postgresql://user:password@localhost:5432/erama
REDIS_URL=redis://localhost:6379
DISCORD_TOKEN=your_discord_bot_token
DISCORD_CHANNEL_ID=your_channel_id
JWT_SECRET=your_jwt_secret
```

4. **Lancer les migrations**
```bash
npm run migration:run
```

5. **Démarrer l'application**
```bash
# Développement
npm run start:dev

# Production
npm run build
npm run start:prod
```

## 🤖 Configuration du Bot Discord

1. Créer une application sur [Discord Developer Portal](https://discord.com/developers/applications)
2. Créer un bot et récupérer le token
3. Inviter le bot sur votre serveur avec les permissions nécessaires :
   - Send Messages
   - Read Message History
   - Add Reactions
   - Use Slash Commands

## 📝 Commandes Discord disponibles

- `/missions` - Liste des missions disponibles
- `/mission <id>` - Détails d'une mission spécifique
- `/postuler <id>` - Postuler à une mission
- `/profile` - Gérer son profil freelance
- `/alert` - Gérer ses alertes de missions

## 🚀 Déploiement

### Railway

1. Connecter votre compte Railway
```bash
railway login
```

2. Lier le projet
```bash
railway link
```

3. Déployer
```bash
railway up
```

### Docker

```bash
docker-compose up -d
```

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Couverture
npm run test:cov
```

## 📚 Documentation API

La documentation Swagger est disponible à l'URL `/api-docs` quand l'application est en cours d'exécution.

## 🔍 Monitoring

- Endpoint de santé : `/health`
- Métriques : `/metrics`
- Logs : Disponibles via `railway logs`

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'feat: Add amazing feature'`)
4. Push sur la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📄 Licence

[MIT](LICENSE)

## 👥 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Contacter l'équipe de développement

## 🔄 CI/CD

Le projet utilise GitHub Actions pour :
- Linting
- Tests automatisés
- Déploiement automatique sur Railway

## ⚠️ Notes importantes

- Le bot nécessite les permissions Discord appropriées
- Configurer correctement les variables d'environnement avant le déploiement
- Suivre les bonnes pratiques de sécurité pour la gestion des tokens
- Maintenir les dépendances à jour