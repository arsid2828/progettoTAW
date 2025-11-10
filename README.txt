# air-min (Angular + Express)

Avvio classico (senza Docker):
1) Backend
   cd backend
   npm.cmd i
   npm.cmd run dev

2) Frontend
   cd air-web
   npm.cmd i
   npm.cmd run start

# Avvio con Docker
cd air-min
docker compose up --build -d

- Frontend: http://localhost:8080
- API: http://localhost:3000/api/flights

Per rebuild pulito:
docker compose down --rmi all -v --remove-orphans
docker builder prune -af
docker compose up --build -d

## MongoDB
- In Docker Compose ho aggiunto `mongo` (porta 27017, volume `mongo_data`).
- L'API si connette con `MONGO_URI=mongodb://mongo:27017/airdb`.
- Seed automatico: se il DB è vuoto, all'avvio inserisce 5 voli demo.

### Avvio con Docker
```bat
cd air-min
docker compose up --build -d
```
- Frontend: http://localhost:8080
- API: http://localhost:3000/api/flights
- MongoDB locale (opzionale): mongodb://localhost:27017/airdb

Se vuoi avviare senza Docker:
1) avvia Mongo locale (o modifica MONGO_URI in `backend/.env`), poi
2) backend: `cd backend && npm.cmd i && npm.cmd run dev`
3) frontend: `cd air-web && npm.cmd i && npm.cmd run start`
