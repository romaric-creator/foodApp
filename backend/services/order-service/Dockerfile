FROM node:18-alpine

WORKDIR /usr/src/app

# Installer les dépendances
# On copie les packages du service ET le dossier shared
COPY package*.json ./
RUN npm install

# Copier le reste du code du service
COPY . .

# Copier le dossier shared (nécessaire car il est référencé par les services)
# On s'attend à ce que le contexte de build soit le dossier 'backend'
COPY shared ./shared

EXPOSE ${PORT}

CMD ["npm", "start"]
