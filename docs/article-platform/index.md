## Introducere

Platforma de Gestionare a Articolelor KnowledgeChain este un sistem scalabil bazat pe microservicii care permite educatorilor să publice și să-și împărtășească cunoștințele cu un public global. Această platformă gestionează administrarea, distribuția și accesibilitatea conținutului într-un mediu eficient și scalabil.

## Arhitectura Frontend

Frontend-ul platformei este construit utilizând:

- **Next.js**: Un framework React modern care oferă renderizare pe server, generare de site-uri statice și multe alte optimizări pentru performanță
- **TailwindCSS**: Un framework CSS utilitar care permite crearea de interfețe rapide și responsive cu un cod minim
- **Amplasat în**: `web/frontend`

Interfața utilizator oferă acces intuitiv la funcționalitățile platformei, cum ar fi:
- Navigarea și căutarea articolelor
- Crearea și editarea conținutului
- Gestionarea contului și profilului
- Interacțiunea cu comentariile și materialele video

## Arhitectura Backend

Backend-ul platformei folosește o arhitectură modernă de microservicii:

- **Containerizare**: Fiecare microserviciu rulează în propriul container Docker, asigurând izolarea și scalabilitatea
- **Reverse Proxy**: Nginx gestionează direcționarea cererilor către microserviciile corespunzătoare
- **Comunicare între servicii**: Apache Kafka facilitează comunicarea asincronă între microservicii
- **Bază de date**: PostgreSQL pentru stocarea persistentă a datelor
- **Scalabilitate**: Arhitectura permite scalarea independentă a fiecărui microserviciu în funcție de cerere

## Microservicii

### Serviciul de Autentificare

Serviciul de autentificare gestionează identitatea utilizatorilor, autorizarea și controlul accesului.

#### Entități principale:
- Utilizatori (Users)
- Roluri (Roles)
- Permisiuni (Permissions)
- Sesiuni (Sessions)
- Token-uri de Reîmprospătare (Refresh Tokens)

#### Funcționalități cheie:
- Autentificarea utilizatorilor prin JWT
- Gestionarea sesiunilor și token-urilor
- Controlul accesului bazat pe roluri
- Reînnoirea token-urilor de acces

#### Model de date:
```
User: id, email, username, password, firstName, lastName, isActive, emailVerified
Role: id, name, description
Permission: id, name, description
UserRole: userId, roleId, assignedAt
RolePermission: roleId, permissionId, assignedAt
Session: id, userId, deviceInfo, ipAddress, lastActivity, isValid, expiresAt
RefreshToken: id, userId, token, expiresAt, createdAt, revokedAt
```

### Serviciul de Articole

Serviciul de articole gestionează crearea, publicarea și interacțiunea cu conținutul educațional.

#### Entități principale:
- Articole (Articles)
- Videoclipuri (Videos)
- Subtitrări (Captions)
- Etichete (Tags)
- Categorii (Categories)
- Comentarii (Comments)

#### Funcționalități cheie:
- Crearea și editarea articolelor
- Gestionarea stării articolelor (ciornă, în revizie, publicat, arhivat)
- Încărcarea și gestionarea videoclipurilor asociate
- Organizarea conținutului prin etichete și categorii
- Sistem de comentarii cu suport pentru răspunsuri

#### Model de date:
```
Article: id, title, slug, content, summary, authorId, status, published, publishedAt, views
Video: id, articleId, url, duration, thumbnail
Caption: id, videoId, language, content
Tag: id, name, slug
Category: id, name, slug, description, parentId
ArticleTag: articleId, tagId, assignedAt
ArticleCategory: articleId, categoryId, assignedAt
Comment: id, articleId, authorId, content, parentId
```

### Serviciul de Utilizatori

Serviciul de utilizatori gestionează profilurile utilizatorilor și portofelele digitale.

#### Entități principale:
- Utilizatori (Users)
- Portofele (Wallets)

#### Funcționalități cheie:
- Crearea și gestionarea profilurilor utilizatorilor
- Asocierea portofelelor digitale cu conturile utilizatorilor
- Actualizarea informațiilor personale

#### Model de date:
```
User: id, email, username, password, firstName, lastName, isActive, emailVerified
Wallet: id, address, userId
```

## Integrarea Sistemului

### Comunicare între Microservicii

Microserviciile comunică între ele prin intermediul Apache Kafka, un sistem de mesagerie distribuit care permite:
- Comunicare asincronă și decuplată
- Procesare în timp real a evenimentelor
- Înaltă disponibilitate și toleranță la erori
- Scalabilitate orizontală

### Flux de Date

1. Frontend-ul trimite cereri către Nginx
2. Nginx direcționează cererile către microserviciul corespunzător
3. Microserviciile procesează cererile și interacționează cu baza de date PostgreSQL
4. Modificările de stare sunt publicate pe Kafka pentru a notifica alte servicii
5. Serviciile ascultă evenimente relevante și își actualizează starea internă corespunzător

### Securitate

- JWT (JSON Web Tokens) pentru autentificare
- RBAC (Role-Based Access Control) pentru autorizare
- Comunicare criptată între servicii
- Izolare la nivel de container pentru protecție

## Baza de Date

Fiecare microserviciu își gestionează propriul schema în baza de date PostgreSQL:

- Schema de autentificare: Informații despre utilizatori, roluri, permisiuni
- Schema de articole: Conținut educațional, organizare, interacțiuni
- Schema de utilizatori: Informații despre profiluri și portofele

Această separare a datelor asigură că fiecare serviciu poate evolua independent, menținând în același timp coerența datelor prin evenimente Kafka.

## Extindere și Întreținere

Arhitectura bazată pe microservicii facilitează:
- Adăugarea de noi funcționalități prin servicii suplimentare
- Actualizarea independentă a componentelor existente
- Scalarea selectivă a serviciilor cu trafic ridicat
- Reziliența la eșecuri prin izolarea problemelor
