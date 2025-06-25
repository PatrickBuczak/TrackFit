# Basisbild
FROM node:21

# Arbeitsverzeichnis im Container erstellen
WORKDIR /app

# Node-Module in einen temporären Ordner kopieren
COPY package*.json ./

# Abhängigkeiten installieren
RUN npm install

# Quellcode in den Container kopieren
COPY . .

# Port freigeben
EXPOSE 4200

# Umgebungsvariable für den Produktionsmodus definieren
ENV NODE_ENV production

# App starten
CMD [ "npm", "run", "start", "--", "--host", "0.0.0.0" ]

