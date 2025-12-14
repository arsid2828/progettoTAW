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



PEr usare jwt e redis serve Fare 
cd backend
npm install jsonwebtoken ioredis
npm install -D @types/jsonwebtoken
avviare un container

# 1. Crea la network (una volta sola)
docker network create taw

# 2. Avvia Redis sulla network taw
docker run -d   --name redis   --network taw   -p 6379:6379   redis:alpine


docker rm -f redis    # -f forza lo stop e la rimozione anche se è in esecuzione
docker run -d --name redis --network taw -p 6379:6379 redis:alpine










INTERFACCE (I-..)
servono per definire dei tipi da assegnare a variabili o come parametro dei themeplate

I service
sono una sorta di model del MODEL VIEW CONTROLLER (MVC) , forniscono dei servizi ai componenti
in genere le richieste http (post,get) vanno messe nei service

per usare i service si usa il DEPENCIES INJECTION (cerca injection con la lente) ad esempio
  authService = inject(AuthService);

i servizzi con l'injection sono in realtà sempre lo stesso, quindi se gli imposto una variabile a partire da un componente
quel valore è visibile anche negli altri componenti che usano lo stesso service




a volte se non carica robe:

cd c:\Users\arsid\Desktop\progettoTAW\frontend
cmd /c "npm ci"
cmd /c "npx ng build"
# poi servi la cartella dist (opzione rapida con http-server)
cd dist\air-web\browser
cmd /c "npx http-server -p 8080 -c-1"

se usi localhost disable cache in f12 e poi ctrl shift r , dopo aver fatto docker compose up --build -d




SE NON FUNZIONA IL BUILD che aggiunge gli aereoporti al mongodb
docker compose build --no-cache
docker compose up


FARE 
npm install bcrypt
npm install -D @types/bcrypt