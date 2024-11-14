FROM node:18-alpine AS builder

WORKDIR /app

# Installer les dépendances nécessaires pour node-gyp
RUN apk add --no-cache python3 make g++

# Copier les fichiers de configuration
COPY package.json ./
COPY tsconfig.json ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY . .

# Build l'application (en utilisant tsconfig.json directement)
RUN npm run build

# Stage de production
FROM node:18-alpine

WORKDIR /app

# Copier package.json pour les dépendances de production
COPY package.json ./

# Installer uniquement les dépendances de production
RUN npm install --omit=dev

# Copier le build depuis l'étape de build
COPY --from=builder /app/dist ./dist

# Exposer le port
EXPOSE 3000

# Variable d'environnement pour le mode production
# ENV NODE_ENV=production
ENV PORT=3000

# Commande de démarrage
CMD ["node", "dist/main.js"]