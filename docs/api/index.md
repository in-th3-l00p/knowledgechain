<think>I need to create comprehensive API documentation based on the OpenAPI specifications for the three microservices:
1. Authentication Service
2. Article Service 
3. User Service

The documentation should be in Romanian and cover all the endpoints, request/response formats, and authentication methods. I'll organize this systematically to be user-friendly and detailed.

I'll structure the documentation like this:
1. Introduction
2. Authentication & Authorization
3. Service Documentation (for each service)
   - Endpoints overview
   - Detailed endpoint documentation
   - Data models

Let me translate and organize the information from the OpenAPI docs into Romanian.</think># Documentația API KnowledgeChain

## Introducere

Această documentație descrie API-urile microserviciilor platformei KnowledgeChain. Platforma folosește o arhitectură de microservicii, cu trei servicii principale care comunică prin API-uri RESTful:

1. **Serviciul de Autentificare** - Gestionează utilizatorii, autentificarea și autorizarea
2. **Serviciul de Articole** - Gestionează conținutul educațional și interacțiunile
3. **Serviciul de Utilizatori** - Gestionează profilurile utilizatorilor și portofelele digitale

Toate API-urile sunt accesibile prin gateway-ul Nginx la adresa `http://localhost:5000` în mediul de dezvoltare.

## Autentificare și Autorizare

Majoritatea endpoint-urilor API necesită autentificare. Platforma folosește autentificare de tip Bearer Token (JWT):

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 1. Serviciul de Autentificare API

### Prezentare Generală a Endpoint-urilor

| Metodă | Endpoint | Descriere |
|--------|----------|-----------|
| POST | /api/auth/login | Autentificarea utilizatorului |
| POST | /api/auth/refresh-token | Reînnoirea token-ului de acces |
| POST | /api/auth/logout | Deconectarea utilizatorului |
| GET | /api/auth/users/profile | Obținerea profilului utilizatorului |
| GET | /api/auth/roles | Obținerea tuturor rolurilor |
| POST | /api/auth/roles | Crearea unui nou rol |
| GET | /api/auth/roles/{id} | Obținerea unui rol după ID |
| PUT | /api/auth/roles/{id} | Actualizarea unui rol |
| DELETE | /api/auth/roles/{id} | Ștergerea unui rol |

### Autentificare

#### Autentificarea Utilizatorului

```
POST /api/auth/login
```

**Cerere:**
```json
{
  "email": "exemplu@email.com",
  "password": "parolaSecreta"
}
```

**Răspuns (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "exemplu@email.com",
    "username": "utilizator_exemplu",
    "roles": ["utilizator", "editor"]
  }
}
```

#### Reînnoirea Token-ului de Acces

```
POST /api/auth/refresh-token
```

**Cerere:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Răspuns (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Deconectarea Utilizatorului

```
POST /api/auth/logout
```

**Cerere:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Răspuns (200 OK):**
```json
{
  "message": "Deconectare reușită"
}
```

### Utilizatori

#### Obținerea Profilului Utilizatorului

```
GET /api/auth/users/profile
```

**Răspuns (200 OK):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "exemplu@email.com",
  "username": "utilizator_exemplu",
  "firstName": "Nume",
  "lastName": "Prenume",
  "roles": [
    {
      "name": "editor",
      "permissions": ["create:articles", "edit:articles"]
    }
  ]
}
```

### Roluri și Permisiuni

#### Obținerea Tuturor Rolurilor

```
GET /api/auth/roles
```

**Răspuns (200 OK):**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "admin",
    "description": "Administrator cu acces complet",
    "permissions": [
      {
        "permission": {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "name": "manage:users"
        }
      }
    ]
  }
]
```

#### Crearea unui Nou Rol

```
POST /api/auth/roles
```

**Cerere:**
```json
{
  "name": "autor",
  "description": "Poate crea și edita articole proprii",
  "permissionIds": [
    "123e4567-e89b-12d3-a456-426614174000",
    "123e4567-e89b-12d3-a456-426614174001"
  ]
}
```

**Răspuns (201 Created):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "autor",
  "description": "Poate crea și edita articole proprii"
}
```

#### Obținerea unui Rol după ID

```
GET /api/auth/roles/{id}
```

**Răspuns (200 OK):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "autor",
  "description": "Poate crea și edita articole proprii",
  "permissions": [
    {
      "permission": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "create:articles"
      }
    }
  ]
}
```

#### Actualizarea unui Rol

```
PUT /api/auth/roles/{id}
```

**Cerere:**
```json
{
  "name": "autor senior",
  "description": "Poate crea, edita și publica articole",
  "permissionIds": [
    "123e4567-e89b-12d3-a456-426614174000",
    "123e4567-e89b-12d3-a456-426614174001",
    "123e4567-e89b-12d3-a456-426614174002"
  ]
}
```

**Răspuns (200 OK):**
```json
{
  "message": "Rol actualizat cu succes"
}
```

#### Ștergerea unui Rol

```
DELETE /api/auth/roles/{id}
```

**Răspuns (200 OK):**
```json
{
  "message": "Rol șters cu succes"
}
```

## 2. Serviciul de Articole API

### Prezentare Generală a Endpoint-urilor

| Metodă | Endpoint | Descriere |
|--------|----------|-----------|
| POST   | /api/articles | Crearea unui articol nou |
| GET    | /api/articles | Obținerea articolelor cu filtrare |
| GET    | /api/articles/{id} | Obținerea unui articol după ID |
| PUT    | /api/articles/{id} | Actualizarea unui articol |
| DELETE | /api/articles/{id} | Ștergerea unui articol |
| GET    | /api/articles/by-slug/{slug} | Obținerea unui articol după slug |
| PATCH  | /api/articles/{id}/status | Actualizarea statusului unui articol |
| POST   | /api/articles/videos | Crearea unui video pentru un articol |
| GET    | /api/articles/videos/{id} | Obținerea unui video după ID |
| PUT    | /api/articles/videos/{id} | Actualizarea unui video |
| DELETE | /api/articles/videos/{id} | Ștergerea unui video |
| POST   | /api/articles/captions | Crearea unei subtitrări pentru un video |
| GET    | /api/articles/captions/{id} | Obținerea unei subtitrări după ID |
| PUT    | /api/articles/captions/{id} | Actualizarea unei subtitrări |
| DELETE | /api/articles/captions/{id} | Ștergerea unei subtitrări |
| POST   | /api/articles/tags | Crearea unei etichete noi |
| GET    | /api/articles/tags | Obținerea tuturor etichetelor |
| POST   | /api/articles/comments | Crearea unui comentariu pentru un articol |
| GET    | /api/articles/comments/{id} | Obținerea unui comentariu după ID |
| PUT    | /api/articles/comments/{id} | Actualizarea unui comentariu |
| DELETE | /api/articles/comments/{id} | Ștergerea unui comentariu |
| GET    | /api/articles/comments/{id}/replies | Obținerea răspunsurilor la un comentariu |
| POST   | /api/articles/comments/{id}/replies | Crearea unui răspuns la un comentariu |

### Articole

#### Crearea unui Articol Nou

```
POST /api/articles
```

**Cerere:**
```json
{
  "title": "Introducere în Inteligența Artificială",
  "content": "Conținutul articolului...",
  "summary": "O scurtă introducere în domeniul AI",
  "authorId": "123e4567-e89b-12d3-a456-426614174000",
  "status": "DRAFT"
}
```

**Răspuns (201 Created):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Introducere în Inteligența Artificială",
  "slug": "introducere-in-inteligenta-artificiala",
  "content": "Conținutul articolului...",
  "summary": "O scurtă introducere în domeniul AI",
  "authorId": "123e4567-e89b-12d3-a456-426614174000",
  "status": "DRAFT",
  "published": false,
  "createdAt": "2023-06-15T10:30:00Z",
  "updatedAt": "2023-06-15T10:30:00Z"
}
```

#### Obținerea Articolelor cu Filtrare

```
GET /api/articles?skip=0&take=10&status=PUBLISHED&authorId=123
```

**Răspuns (200 OK):**
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Introducere în Inteligența Artificială",
      "slug": "introducere-in-inteligenta-artificiala",
      "summary": "O scurtă introducere în domeniul AI",
      "status": "PUBLISHED",
      "published": true,
      "publishedAt": "2023-06-16T12:00:00Z",
      "views": 150
    }
  ],
  "total": 45,
  "skip": 0,
  "take": 10
}
```

#### Actualizarea Statusului unui Articol

```
PATCH /api/articles/{id}/status
```

**Cerere:**
```json
{
  "status": "PUBLISHED"
}
```

**Răspuns (200 OK):**
```json
{
  "message": "Status actualizat cu succes"
}
```

### Videoclipuri și Subtitrări

#### Crearea unui Video pentru un Articol

```
POST /api/articles/videos
```

**Cerere:**
```json
{
  "articleId": "123e4567-e89b-12d3-a456-426614174000",
  "url": "https://example.com/videos/intro-ai.mp4",
  "duration": 600,
  "thumbnail": "https://example.com/thumbnails/intro-ai.jpg"
}
```

**Răspuns (201 Created):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "articleId": "123e4567-e89b-12d3-a456-426614174000",
  "url": "https://example.com/videos/intro-ai.mp4",
  "duration": 600,
  "thumbnail": "https://example.com/thumbnails/intro-ai.jpg",
  "createdAt": "2023-06-15T14:30:00Z",
  "updatedAt": "2023-06-15T14:30:00Z"
}
```

#### Crearea unei Subtitrări pentru un Video

```
POST /api/articles/captions
```

**Cerere:**
```json
{
  "videoId": "123e4567-e89b-12d3-a456-426614174000",
  "language": "ro",
  "content": "Conținutul subtitrării în format VTT sau similar"
}
```

**Răspuns (201 Created):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "videoId": "123e4567-e89b-12d3-a456-426614174000",
  "language": "ro",
  "content": "Conținutul subtitrării în format VTT sau similar",
  "createdAt": "2023-06-15T15:00:00Z",
  "updatedAt": "2023-06-15T15:00:00Z"
}
```

### Etichete și Categorii

#### Crearea unei Etichete Noi

```
POST /api/articles/tags
```

**Cerere:**
```json
{
  "name": "Inteligență Artificială",
  "slug": "inteligenta-artificiala"
}
```

**Răspuns (201 Created):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Inteligență Artificială",
  "slug": "inteligenta-artificiala",
  "createdAt": "2023-06-15T16:00:00Z",
  "updatedAt": "2023-06-15T16:00:00Z"
}
```

### Comentarii

#### Crearea unui Comentariu pentru un Articol

```
POST /api/articles/comments
```

**Cerere:**
```json
{
  "articleId": "123e4567-e89b-12d3-a456-426614174000",
  "authorId": "123e4567-e89b-12d3-a456-426614174000",
  "content": "Un comentariu foarte util despre articol!"
}
```

**Răspuns (201 Created):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "articleId": "123e4567-e89b-12d3-a456-426614174000",
  "authorId": "123e4567-e89b-12d3-a456-426614174000",
  "content": "Un comentariu foarte util despre articol!",
  "createdAt": "2023-06-15T17:00:00Z",
  "updatedAt": "2023-06-15T17:00:00Z"
}
```

#### Crearea unui Răspuns la un Comentariu

```
POST /api/articles/comments/{id}/replies
```

**Cerere:**
```json
{
  "articleId": "123e4567-e89b-12d3-a456-426614174000",
  "authorId": "123e4567-e89b-12d3-a456-426614174001",
  "content": "Mulțumesc pentru comentariul tău!"
}
```

**Răspuns (201 Created):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174001",
  "articleId": "123e4567-e89b-12d3-a456-426614174000",
  "authorId": "123e4567-e89b-12d3-a456-426614174001",
  "content": "Mulțumesc pentru comentariul tău!",
  "parentId": "123e4567-e89b-12d3-a456-426614174000",
  "createdAt": "2023-06-15T17:15:00Z",
  "updatedAt": "2023-06-15T17:15:00Z"
}
```

## 3. Serviciul de Utilizatori API

### Prezentare Generală a Endpoint-urilor

| Metodă | Endpoint | Descriere |
|--------|----------|-----------|
| GET    | /api/users | Obținerea tuturor utilizatorilor |
| POST   | /api/users | Crearea unui utilizator nou |
| GET    | /api/users/{id} | Obținerea unui utilizator după ID |
| PUT    | /api/users/{id} | Actualizarea unui utilizator |
| DELETE | /api/users/{id} | Ștergerea unui utilizator |
| POST   | /api/users/wallets | Crearea unui portofel pentru un utilizator |
| GET    | /api/users/wallets/{id} | Obținerea unui portofel după ID |
| PUT    | /api/users/wallets/{id} | Actualizarea unui portofel |
| DELETE | /api/users/wallets/{id} | Ștergerea unui portofel |
| GET    | /api/users/wallets/user/{userId} | Obținerea portofelului unui utilizator |
| GET    | /api/users/wallets/address/{address} | Obținerea portofelului după adresă |

### Utilizatori

#### Obținerea Tuturor Utilizatorilor

```
GET /api/users?skip=0&take=10
```

**Răspuns (200 OK):**
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "exemplu@email.com",
      "username": "utilizator_exemplu",
      "firstName": "Nume",
      "lastName": "Prenume",
      "isActive": true,
      "emailVerified": true,
      "createdAt": "2023-06-01T10:00:00Z",
      "updatedAt": "2023-06-01T10:00:00Z"
    }
  ],
  "meta": {
    "total": 100,
    "skip": 0,
    "take": 10
  }
}
```

#### Crearea unui Utilizator Nou

```
POST /api/users
```

**Cerere:**
```json
{
  "email": "nou@email.com",
  "username": "utilizator_nou",
  "password": "parolaSecreta",
  "firstName": "Prenume",
  "lastName": "Nume"
}
```

**Răspuns (201 Created):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "nou@email.com",
  "username": "utilizator_nou",
  "firstName": "Prenume",
  "lastName": "Nume",
  "isActive": true,
  "emailVerified": false,
  "createdAt": "2023-06-15T10:00:00Z",
  "updatedAt": "2023-06-15T10:00:00Z"
}
```

### Portofele

#### Crearea unui Portofel pentru un Utilizator

```
POST /api/users/wallets
```

**Cerere:**
```json
{
  "address": "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  "userId": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Răspuns (201 Created):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "address": "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "createdAt": "2023-06-15T11:00:00Z",
  "updatedAt": "2023-06-15T11:00:00Z"
}
```

#### Obținerea Portofelului unui Utilizator

```
GET /api/users/wallets/user/{userId}
```

**Răspuns (200 OK):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "address": "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "createdAt": "2023-06-15T11:00:00Z",
  "updatedAt": "2023-06-15T11:00:00Z"
}
```

#### Obținerea Portofelului după Adresă

```
GET /api/users/wallets/address/{address}
```

**Răspuns (200 OK):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "address": "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "createdAt": "2023-06-15T11:00:00Z",
  "updatedAt": "2023-06-15T11:00:00Z"
}
```

## Coduri de Eroare

| Cod | Descriere |
|-----|-----------|
| 400 | Cerere invalidă - Datele trimise nu sunt corecte sau complete |
| 401 | Neautorizat - Lipsește token-ul de autentificare sau este invalid |
| 403 | Interzis - Utilizatorul nu are permisiunile necesare pentru această acțiune |
| 404 | Nu a fost găsit - Resursa solicitată nu există |
| 500 | Eroare internă de server - A apărut o problemă pe server |

## Tipuri de Date Comune

### Stări Articol
- `DRAFT` - Ciornă
- `PENDING_REVIEW` - În așteptarea revizuirii
- `PUBLISHED` - Publicat
- `ARCHIVED` - Arhivat
