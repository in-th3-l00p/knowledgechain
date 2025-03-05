## Introducere

Acest ghid descrie procesul de implementare și rulare a platformei KnowledgeChain, incluzând atât aplicațiile frontend (Next.js și Laravel), cât și arhitectura de microservicii backend bazată pe Docker. Urmați cu atenție pașii de mai jos pentru a configura și lansa toate componentele sistemului.

## Cerințe Preliminare

Înainte de a începe implementarea, asigurați-vă că aveți instalate următoarele:

- **Docker** și **Docker Compose** (versiunea recomandată: 20.10+)
- **Node.js** (versiunea recomandată: 18+ pentru compatibilitate cu Next.js)
- **PHP** (versiunea minimă: 8.2)
- **Composer** (gestionar de dependințe PHP)
- **Git** (pentru clonarea codului sursă)

## Structura Proiectului

Proiectul KnowledgeChain este organizat în următoarele componente principale:

```
KnowledgeChain/
├── docker-compose.yml      # Configurare Docker pentru microservicii
├── nginx/                  # Configurație Nginx
├── rest/                   # Microserviciile backend
│   ├── auth-service/       # Serviciu de autentificare
│   ├── user-service/       # Serviciu de utilizatori
│   └── article-service/    # Serviciu de articole
├── web/
│   ├── frontend/           # Aplicația Next.js
│   └── coach-app/          # Aplicația Laravel
```

## 1. Configurarea Mediului

### Clonarea Repositoriului

```bash
git clone https://github.com/your-organization/knowledgechain.git
cd knowledgechain
```

### Configurarea Variabilelor de Mediu

Creați fișiere `.env` pentru fiecare componentă:

1. În directorul `rest/auth-service/`:
```bash
cp .env.example .env
```

2. În directorul `rest/user-service/`:
```bash
cp .env.example .env
```

3. În directorul `rest/article-service/`:
```bash
cp .env.example .env
```

4. În directorul `web/coach-app/`:
```bash
cp .env.example .env
```

5. În directorul `web/frontend/`:
```bash
cp .env.example .env
```

## 2. Implementarea Microserviciilor cu Docker

Arhitectura de microservicii folosește Docker pentru containere și Kafka pentru comunicarea între servicii.

### Pornirea Infrastructurii Docker

```bash
# Din directorul rădăcină al proiectului
docker-compose up -d
```

Această comandă va crea și porni următoarele servicii:

- **postgres**: Baza de date PostgreSQL
- **zookeeper** și **kafka**: Pentru comunicarea asincronă între servicii
- **kafka-ui**: Interfață web pentru monitorizarea Kafka (accesibilă la http://localhost:8080)
- **auth-service**: Serviciul de autentificare (port 3001)
- **user-service**: Serviciul de utilizatori (port 3002)
- **article-service**: Serviciul de articole (port 3003)
- **nginx**: Proxy invers care expune toate serviciile pe portul 5000

### Verificarea Serviciilor

Verificați dacă toate containerele rulează corect:

```bash
docker-compose ps
```

Toate serviciile ar trebui să aibă statusul "Up". Dacă există servicii cu erori, verificați jurnalele:

```bash
docker-compose logs [numele-serviciului]
```

### Inițializarea Bazelor de Date

Pentru a inițializa schema bazelor de date:

```bash
# Pentru serviciul de autentificare
docker-compose exec auth-service npx prisma migrate deploy

# Pentru serviciul de utilizatori
docker-compose exec user-service npx prisma migrate deploy

# Pentru serviciul de articole
docker-compose exec article-service npx prisma migrate deploy
```

## 3. Implementarea Aplicației de Coaching (Laravel)

### Instalarea Dependințelor

```bash
cd web/coach-app
composer install
```

### Configurarea Bazei de Date

Editați fișierul `.env` pentru a configura conexiunea la baza de date:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=coach_app
DB_USERNAME=root
DB_PASSWORD=
```

### Migrarea Bazei de Date

```bash
php artisan migrate
```

### Generarea Cheii de Aplicație

```bash
php artisan key:generate
```

### Configurarea OpenAI

Pentru funcționalitatea de potrivire bazată pe AI, configurați cheia API OpenAI în fișierul `.env`:

```
OPENAI_API_KEY=your_api_key_here
```

### Pornirea Serverului Laravel

```bash
php artisan serve --port=8000
```

Aplicația de coaching va fi disponibilă la adresa: http://localhost:8000

### Pornirea Queue Worker și Broadcasting

Pentru funcționalitățile de chat în timp real și procesare asincronă:

```bash
# Într-un terminal separat
php artisan queue:work

# Într-un alt terminal (dacă folosiți Laravel Reverb pentru WebSockets)
php artisan reverb:start
```

## 4. Implementarea Frontend-ului Next.js

### Instalarea Dependințelor

```bash
cd web/frontend
npm install
```

### Configurarea Variabilelor de Mediu

Editați fișierul `.env` pentru a configura conexiunea la API:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Construirea și Pornirea Aplicației

Pentru mediul de dezvoltare:

```bash
npm run dev
```

Pentru producție:

```bash
npm run build
npm run start
```

Aplicația frontend va fi disponibilă la adresa: http://localhost:3000

## 5. Verificarea Implementării

După ce toate componentele sunt pornite, verificați dacă sistemul funcționează corect:

1. Accesați frontend-ul Next.js la http://localhost:3000
2. Accesați aplicația de coaching la http://localhost:8000
3. Verificați interfața Kafka UI la http://localhost:8080
4. Testați endpoint-urile API la http://localhost:5000/api/...

## 6. Implementare pentru Producție

Pentru implementarea în mediul de producție, sunt necesari pași suplimentari:

### Configurații Docker pentru Producție

Creați un fișier `docker-compose.prod.yml` cu configurații optime pentru producție:

```yaml
# Exemplu de configurație pentru producție (docker-compose.prod.yml)
services:
  # Similar cu docker-compose.yml, dar cu:
  # - Volume persistente pentru date
  # - Variabile de mediu pentru producție
  # - Fără volume de dezvoltare montate
  # - Fără porturi expuse în exterior (cu excepția proxy-ului)
```

### Configurații Next.js pentru Producție

```bash
cd web/frontend
npm run build
# Folosiți un manager de procese cum ar fi PM2 pentru a rula aplicația
pm2 start npm --name "frontend" -- start
```

### Configurații Laravel pentru Producție

Pentru Laravel, este recomandat să utilizați un server web precum Nginx cu PHP-FPM:

```bash
cd web/coach-app
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## 7. Probleme Frecvente și Depanare

### Probleme cu Microserviciile

- **Serviciile nu pornesc**: Verificați jurnalele cu `docker-compose logs [service-name]`
- **Kafka nu funcționează**: Verificați conectivitatea între servicii și configurația brokerilor Kafka

### Probleme cu Aplicația Laravel

- **Erori de permisiuni**: Asigurați-vă că directoarele `storage` și `bootstrap/cache` au permisiuni de scriere
- **Probleme cu WebSockets**: Verificați configurația Laravel Echo și Pusher/Reverb

### Probleme cu Next.js

- **Erori de build**: Verificați compatibilitatea dependințelor în `package.json`
- **Probleme de conectare la API**: Verificați variabilele de mediu și CORS

## 8. Backup și Restaurare

### Backup Baze de Date

```bash
# Backup PostgreSQL pentru microservicii
docker-compose exec postgres pg_dump -U postgres auth-service > auth_backup.sql
docker-compose exec postgres pg_dump -U postgres user-service > user_backup.sql
docker-compose exec postgres pg_dump -U postgres article-service > article_backup.sql

# Backup pentru baza de date a aplicației Laravel
php artisan db:backup
```

### Restaurare Baze de Date

```bash
# Restaurare PostgreSQL pentru microservicii
cat auth_backup.sql | docker-compose exec -T postgres psql -U postgres -d auth-service
cat user_backup.sql | docker-compose exec -T postgres psql -U postgres -d user-service
cat article_backup.sql | docker-compose exec -T postgres psql -U postgres -d article-service

# Restaurare pentru baza de date a aplicației Laravel
php artisan db:restore
```

## Concluzie

Acest ghid oferă instrucțiunile necesare pentru implementarea completă a platformei KnowledgeChain, incluzând atât microserviciile backend, cât și aplicațiile frontend. Urmați cu atenție fiecare pas și consultați documentația specifică a fiecărei tehnologii pentru detalii suplimentare.

Pentru întrebări sau probleme legate de implementare, consultați echipa de dezvoltare sau repository-ul oficial al proiectului.
