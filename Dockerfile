FROM node:16-slim

WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json tsconfig.json ./

# Installer les dépendances avec les permissions appropriées
RUN npm install --include=dev \
    && mkdir -p /app/node_modules/.cache \
    && chmod -R 777 /app/node_modules

# Copier le code source
COPY src/ ./src/

# Définir les permissions pour le build
RUN chmod -R 777 /app

# Build
RUN npm run build

# Nettoyer les dépendances de développement
RUN npm ci --omit=dev

# Démarrer l'application
CMD ["npm", "start"]