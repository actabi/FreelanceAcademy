FROM node:18-alpine AS builder

WORKDIR /app

# Installer les dépendances nécessaires pour node-gyp
RUN apk add --no-cache python3 make g++

# Copier uniquement les fichiers nécessaires pour l'installation
COPY package.json ./
COPY tsconfig.json ./

# Installer les dépendances avec npm install
RUN npm install

# Copier le reste du code source
COPY . .

# Build l'application
RUN npm run build

# Stage de production
FROM node:18-alpine

WORKDIR /app

# Copier les fichiers nécessaires
COPY package.json ./

# Installer uniquement les dépendances de production
RUN npm install --omit=dev

# Copier le build depuis l'étape de build
COPY --from=builder /app/dist ./dist

# Exposer le port
EXPOSE 3000

# Variable d'environnement pour le mode production
ENV NODE_ENV=production

# Commande de démarrage
CMD ["npm", "run", "start:prod"]