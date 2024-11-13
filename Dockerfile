# Étape de build
FROM node:18-alpine AS builder

WORKDIR /app

# Installer les dépendances nécessaires pour node-gyp
RUN apk add --no-cache python3 make g++

# Copier les fichiers de configuration
COPY package*.json ./
COPY tsconfig.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY . .

# Build l'application
RUN npm run build

# Étape de production
FROM node:18-alpine

WORKDIR /app

# Copier les dépendances et le build depuis l'étape de build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "run", "start:prod"]