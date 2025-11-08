# ---- Build ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY angular.json ./
COPY tsconfig*.json ./
COPY src ./src
RUN npm run build

# ---- Runtime ----
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copia TUTTA la cartella di output (wildcard se il nome progetto cambia)
COPY --from=build /app/dist/*/browser/ /usr/share/nginx/html/
EXPOSE 80
