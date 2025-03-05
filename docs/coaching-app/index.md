## Introducere

Aplicația de Coaching KnowledgeChain este o platformă educațională avansată construită pentru a facilita conexiunea directă între studenți și profesori într-un mediu digital interactiv. Această aplicație folosește un algoritm inteligent de potrivire bazat pe inteligență artificială pentru a ajuta studenții să găsească profesorul ideal care corespunde nevoilor și obiectivelor lor educaționale.

## Tehnologii Utilizate

Aplicația este dezvoltată folosind următoarele tehnologii:
- **Laravel**: Framework PHP pentru backend
- **Tailwind CSS**: Framework CSS pentru design-ul interfeței
- **OpenAI SDK**: Pentru procesarea algoritmului de potrivire bazat pe inteligență artificială
- **Laravel Eloquent**: ORM pentru interacțiuni cu baza de date
- **Laravel Broadcasting**: Pentru funcționalități în timp real, cum ar fi chatul între profesori și studenți

## Caracteristici Principale

Pe baza analizei fișierului `web.php`, aplicația oferă următoarele funcționalități:

1. **Dashboard Personalizat**: Panou de control pentru utilizatori după autentificare
2. **Profiluri Profesionale**: Gestionarea informațiilor profesionale pentru profesori
3. **Explorare Profesori**: Funcționalități pentru căutarea și vizualizarea profilurilor profesorilor disponibili
4. **Sistem de Chat**: Comunicare în timp real între studenți și profesori
5. **Gestionarea Sesiunilor**: Programarea, vizualizarea și anularea sesiunilor de coaching
6. **Gestionarea Disponibilității**: Profesorii pot seta intervalele orare în care sunt disponibili
7. **Sistem de Recenzii**: Pentru evaluarea experienței de coaching

## Structura Bazei de Date

Analizând migrările disponibile, structura bazei de date include:

### Tabela `users`
- Informații standard despre utilizatori (nume, email, parolă)
- Stochează datele de autentificare pentru toți utilizatorii platformei

### Tabela `coach_profiles`
- Profiluri extinse pentru profesori, legate de tabela utilizatori
- Stochează informații precum:
  - Biografie profesională
  - Ani de experiență
  - Tarif orar
  - Educație și experiență profesională
  - Interese, limbi vorbite și locație
  - Stil de coaching și specializare
  - Disponibilitate generală

### Tabela `skills`
- Competențe disponibile în platformă
- Include numele și descrierea fiecărei competențe

### Tabela `coach_skills`
- Relația many-to-many între profesori și competențe
- Include nivelul de competență (1-5) pentru fiecare abilitate a unui profesor

### Tabela `coaching_sessions`
- Sesiuni programate între profesori și studenți
- Include data începerii și terminării, statusul și note
- Statusul poate fi: programată, completată sau anulată

### Tabela `reviews`
- Recenzii lăsate de studenți pentru profesori după sesiuni
- Include evaluarea (1-5) și comentarii

### Tabela `chat_messages`
- Mesaje schimbate între utilizatori
- Include un indicator pentru mesajele generate de AI

## Fluxuri de Utilizare

### Pentru Studenți:
1. Înregistrare și creare profil
2. Explorare profesori disponibili
3. Vizualizare profiluri și recenzii ale profesorilor
4. Inițiere conversații cu profesorii potențiali
5. Programarea sesiunilor de coaching
6. Participare la sesiuni
7. Oferire feedback prin recenzii

### Pentru Profesori:
1. Înregistrare și creare profil profesional
2. Adăugare competențe și niveluri de expertiză
3. Gestionare disponibilitate
4. Comunicare cu studenții prin sistem de chat
5. Participare la sesiuni programate
6. Vizualizare recenzii

## Arhitectura Sistemului

Aplicația de coaching folosește:
- **Arhitectură MVC** prin Laravel
- **Sistem de rutare** pentru gestionarea solicitărilor HTTP
- **Middleware-uri** pentru autentificare și autorizare
- **Broadcasting** pentru actualizări în timp real ale conversațiilor
- **OpenAI API** pentru algoritm inteligent de potrivire

Sistemul de potrivire bazat pe inteligență artificială analizează profilurile profesorilor, competențele lor și feedback-urile primite pentru a recomanda studenților profesorii cei mai potriviți pentru nevoile lor educaționale specifice.

## Securitate

Aplicația folosește sistemul de autentificare Laravel Sanctum pentru a asigura accesul securizat la funcționalități și date, cu roluri diferite pentru studenți și profesori.
