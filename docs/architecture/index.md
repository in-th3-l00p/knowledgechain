## Introducere

Arhitectura KnowledgeChain reprezintă fundamentul tehnic al platformei educaționale care conectează studenți, profesori și conținut educațional într-un ecosistem integrat. Această documentație oferă o prezentare detaliată a componentelor arhitecturale, a modelelor de date, a fluxurilor de informații și a integrărilor dintre diferitele subsisteme ale platformei.

## Prezentare Generală a Sistemului

KnowledgeChain este compus din două aplicații principale care funcționează sinergic:

1. **Aplicația de Coaching**: O platformă personalizată bazată pe Laravel care facilitează conexiunea dintre studenți și profesori prin intermediul unui algoritm de potrivire bazat pe inteligență artificială.

2. **Platforma de Gestionare a Articolelor**: Un sistem distribuit bazat pe microservicii care permite crearea, publicarea și distribuirea conținutului educațional.

Aceste două componente sunt integrate pentru a oferi o experiență educațională completă, unde utilizatorii pot accesa atât sesiuni personalizate de coaching cât și conținut educațional structurat.

## Arhitectura Frontend

### Frontend Aplicație de Coaching
- **Framework**: Laravel Blade + Livewire
- **Design**: Tailwind CSS
- **Interactivitate**: Alpine.js și Laravel Echo pentru funcționalități în timp real
- **Localizare**: În directorul `web/coach-app/resources/views`

### Frontend Platformă de Articole
- **Framework**: Next.js (React)
- **Design**: Tailwind CSS
- **State Management**: Context API și React Query
- **Localizare**: În directorul `web/frontend`

### Componentele de Interfață Comune
- Sistemul de autentificare unificat
- Navigare consistentă între aplicații
- Design system unitar
- Experiență de utilizare coerentă

## Arhitectura Backend

### Aplicația de Coaching (Monolitic)
- **Framework**: Laravel
- **Model arhitectural**: MVC (Model-View-Controller)
- **ORM**: Eloquent pentru interacțiunea cu baza de date
- **Broadcasting**: Laravel Echo Server și Socket.io pentru comunicare în timp real
- **Integrare AI**: OpenAI SDK pentru algoritmul de potrivire
- **Middleware-uri**: Pentru autentificare, autorizare și alte funcționalități transversale

### Platforma de Articole (Microservicii)
- **Containerizare**: Docker pentru izolarea serviciilor
- **Orchestrare**: Docker Compose pentru dezvoltare, potențial Kubernetes pentru producție
- **Reverse Proxy**: Nginx pentru rutarea cererilor către microserviciile corespunzătoare
- **Comunicare asincronă**: Apache Kafka pentru comunicarea între servicii

#### Microservicii Principale:
1. **Serviciul de Autentificare**:
   - Gestionează utilizatori, roluri, permisiuni
   - Implementează autentificare JWT
   - Asigură controlul accesului bazat pe roluri (RBAC)

2. **Serviciul de Articole**:
   - Gestionează conținutul educațional
   - Administrează articole, videoclipuri, categorii, etichete
   - Oferă funcționalități pentru comentarii și interacțiune

3. **Serviciul de Utilizatori**:
   - Gestionează profilurile utilizatorilor
   - Administrează portofelele digitale pentru integrare Web3
   - Sincronizează datele de utilizator între servicii

## Arhitectura Bazei de Date

### Baza de Date pentru Aplicația de Coaching
- **SGBD**: MySQL/PostgreSQL
- **Modele principale**:
  - Users: Informații de bază despre utilizatori
  - Coach Profiles: Profiluri extinse pentru profesori
  - Skills: Competențe disponibile în platformă
  - Coach Skills: Asocierea competențelor cu profesorii
  - Coaching Sessions: Sesiuni programate între profesori și studenți
  - Reviews: Recenzii pentru sesiunile de coaching
  - Chat Messages: Mesaje schimbate între utilizatori

### Baza de Date pentru Platforma de Articole
- **SGBD**: PostgreSQL
- **Schema separată pentru fiecare microserviciu**:
  - **Schema Auth**:
    - Users, Roles, Permissions
    - Sessions, Refresh Tokens
  - **Schema Articles**:
    - Articles, Videos, Captions
    - Tags, Categories
    - Comments
  - **Schema Users**:
    - Users
    - Wallets

## Integrarea Subsistemelor

### Integrarea între Aplicația de Coaching și Platforma de Articole
- **Autentificare unificată**: Utilizatorii folosesc același cont în ambele sisteme
- **Partajarea profilurilor**: Informațiile de profil sunt sincronizate între sisteme
- **Recomandări încrucișate**: Articole recomandate în funcție de sesiunile de coaching și invers
- **Notificări unificate**: Sistem centralizat de notificări pentru toate evenimentele

### Comunicarea între Subsisteme
- **API Gateway**: Pentru rutarea și agregarea cererilor între subsisteme
- **Event Bus**: Apache Kafka pentru comunicarea asincronă bazată pe evenimente
- **Cache distribuit**: Redis pentru stocarea temporară a datelor frecvent accesate

## Arhitectura de Securitate

### Autentificare și Autorizare
- **Aplicația de Coaching**: Laravel Sanctum pentru autentificare
- **Platforma de Articole**: JWT pentru autentificare între microservicii
- **RBAC**: Control de acces bazat pe roluri implementat în ambele sisteme

### Securitatea Datelor
- **Criptare în tranzit**: HTTPS pentru toate comunicațiile
- **Criptare la repaus**: Pentru datele sensibile stocate în baze de date
- **Anonimizare**: Pentru date utilizate în analize și rapoarte

### Securitatea Infrastructurii
- **Izolare**: Containerizare Docker pentru izolarea serviciilor
- **Securitate perimetrală**: Firewall și WAF (Web Application Firewall)
- **Scanare de vulnerabilități**: Analiză continuă a codului și dependențelor

## Arhitectura de Scalabilitate

### Scalabilitate Aplicație de Coaching
- **Scalare verticală**: Adăugarea de resurse la serverele existente
- **Load balancing**: Distribuirea traficului între multiple instanțe ale aplicației
- **Optimizarea bazei de date**: Indexare și caching pentru performanță

### Scalabilitate Platformă de Articole
- **Scalare orizontală**: Adăugarea de noi instanțe ale microserviciilor
- **Partajarea bazei de date**: Fragmentarea datelor pentru distribuire optimă
- **CDN**: Pentru distribuirea globală a conținutului static

## Arhitectura de Dezvoltare și Implementare

### Medii de Dezvoltare
- **Local**: Setări de dezvoltare pentru fiecare dezvoltator
- **Staging**: Mediu similar cu producția pentru testare
- **Producție**: Mediu optimizat pentru performanță și securitate

### CI/CD
- **Integrare continuă**: Testare automată a codului
- **Livrare continuă**: Automatizarea procesului de implementare
- **Monitorizare**: Observabilitate asupra performanței și erorilor

### Gestionarea Codului
- **Versionare**: Git pentru versionarea codului
- **Branching strategy**: Gitflow sau similar pentru organizarea dezvoltării
- **Revizii de cod**: Proces de revizuire pentru menținerea calității

## Arhitectura Algoritmului de Potrivire AI

### Componentele Algoritmului
- **Analiza profilurilor**: Procesarea informațiilor din profilurile profesorilor
- **Analiza feedback-ului**: Evaluarea recenziilor anterioare
- **Potrivirea competențelor**: Corelarea nevoilor studenților cu expertiza profesorilor

### Fluxul Procesului
1. Colectarea datelor din profiluri și preferințe
2. Procesarea datelor prin modelul de AI (OpenAI)
3. Generarea recomandărilor personalizate
4. Rafinarea continuă a modelului pe baza feedback-ului

## Concluzii

Arhitectura KnowledgeChain combină eficient două abordări arhitecturale distincte - monolitică pentru aplicația de coaching și microservicii pentru platforma de articole - pentru a oferi o soluție educațională completă și scalabilă. Această abordare hibridă permite:

- Dezvoltare rapidă și simplă pentru componentele care necesită integrare strânsă (coaching)
- Scalabilitate și reziliență pentru componentele cu cerințe ridicate de trafic (articole)
- Flexibilitate în alegerea tehnologiilor potrivite pentru fiecare componentă
- Evoluție independentă a subsistemelor, menținând în același timp integrarea la nivel de platformă

Prin această arhitectură, KnowledgeChain poate oferi o experiență educațională personalizată, scalabilă și fiabilă, facilitând conexiunea între studenți, profesori și conținut educațional într-un ecosistem digital integrat.
