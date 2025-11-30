# air-min (Angular + Express)
Appena pullato bisogna entrare in backend tramite terminale e scrivere 
npm install per scaricare le dipendenze necessarie, stessa cosa con frontend 
aggiungendo se non basta npm i @angular/router@^17.3.0.
Avvio classico (senza Docker):
1) Backend
   cd backend
   npm.cmd i
   npm.cmd run dev

2) Frontend
   cd frontend
   npm.cmd i
   npm.cmd run start

# Avvio con Docker
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
docker compose up --build -d
```
- Frontend: http://localhost:8080
- API: http://localhost:3000/api/flights
- MongoDB locale (opzionale): mongodb://localhost:27017/airdb

Se vuoi avviare senza Docker:
1) avvia Mongo locale (o modifica MONGO_URI in `backend/.env`), poi
2) backend: `cd backend && npm.cmd i && npm.cmd run dev`
3) frontend: `cd air-web && npm.cmd i && npm.cmd run start`






per creare un componente 
ng generate component nome-separato-con-trattini

per un interfaccia fate
ng generate interface i-nome-separato-con-trattini


per i servizi  fate
ng generate service nome-separato-con-trattini