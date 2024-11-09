# Utiliser Node.js 18 ou supérieur qui inclut ReadableStream
FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendancesd
RUN npm install

# Copier le reste des fichiers
COPY . .

# Build
RUN npm run build

# Nettoyer les dépendances de développement
RUN npm prune --production

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "start"]