# =========================
# STAGE 1 — Build Angular
# =========================
FROM node:20-alpine AS build
WORKDIR /app

# Dipendenze (usa ci per lockfile deterministico)
COPY package*.json ./
RUN npm ci

# Sorgenti e build
COPY . .
# Il builder "application" di Angular mette l'output in dist/<proj>/browser/
RUN npm run build

# =========================
# STAGE 2 — Nginx runtime
# =========================
FROM nginx:1.28-alpine

# Togli qualsiasi conf di default e usa la nostra
RUN rm -f /etc/nginx/conf.d/*

# Copia la config minimale per SPA + proxy /api
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Pulisci webroot e copia L'OUTPUT CORRETTO: dist/air-web/browser/
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist/air-web/browser/ /usr/share/nginx/html/

# Permessi di lettura per nginx (di solito non serve, ma è innocuo)
RUN chmod -R a+r /usr/share/nginx/html

EXPOSE 80
