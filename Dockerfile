FROM node:16

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer toutes les dépendances, y compris devDependencies
RUN npm install --include=dev

# Copier le reste des fichiers
COPY . .

# Donner les permissions explicites
RUN chmod -R 777 node_modules/
RUN chmod -R 777 node_modules/.bin/
RUN chmod +x node_modules/.bin/tsc

# Build
RUN npm run build

# Pour la production, nous pouvons maintenant installer uniquement les dépendances de production
RUN npm ci --omit=dev

# Démarrer l'application
CMD ["npm", "start"]