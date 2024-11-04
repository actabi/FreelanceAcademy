FROM node:16-slim

WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json tsconfig.json ./

# Installer toutes les dépendances (y compris devDependencies pour le build)
RUN npm install

# Copier le code source
COPY src/ ./src/

# Build
RUN npm run build

# Nettoyer les dépendances de développement
RUN npm ci --omit=dev

# Démarrer l'application
CMD ["npm", "start"]