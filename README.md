# Monkey_Rider
Accendi la tua passione per i motori: scegli il meglio per la tua auto, scegli noi! 
# Come avviare il sito:
* Frontend: ng serve
* Backend: npm start
# Struttura Frontend:
```bash
src/
│
├── app/
│   ├── core/                // Servizi condivisi, guardie, interceptor, modelli base
│   ├── shared/              // Componenti, pipe e direttive riutilizzabili
│   ├── layout/              // Header, Footer, Sidebar, ecc.
│   ├── features/
│   │   ├── home/            // Homepage
│   │   ├── auth/            // Login, Registrazione
│   │   ├── cart/            // Carrello
│   │   ├── wishlist/        // Wishlist
│   │   ├── products/        // Visualizza tutti i prodotti, dettaglio prodotto
│   │   ├── selector/        // Selettore per compatibilità veicolo
│   │   ├── orders/          // Visualizzazione ordini, tracking, pagamenti
│   │   ├── inventory/       // Gestione scorte e riordino (solo dipendenti)
│   │   ├── admin/           // Sezione amministrativa (gestione utenti, prodotti, ecc.)
│   ├── app-routing.module.ts
│   ├── app.component.ts
│   ├── app.module.ts
│
├── assets/                  // Immagini, icone, file statici
├── environments/            // env files
└── styles/                  // SCSS/CSS globali
```

# INFO PER IL DB
### per avviare:
```bash
# 1. Verifica che Docker sia attivo
docker --version

# 2. Avvia il database PostgreSQL
docker-compose up -d

# 3. Verifica che il container sia in esecuzione
docker-compose ps

# 4. Controlla i log per assicurarti che tutto sia OK
docker-compose logs postgres
```
```bash
Monkey_Rider/
├── docker-compose.yml          ← Il "ricettario" per Docker
├── database/                   ← Cartella con i file SQL
│   └── init/                   ← Script che si eseguono all'avvio
│       ├── 01_create_tables.sql
│       └── 02_insert_data.sql
├── frontend/                   ← Il tuo Angular
└── backend/                    ← Il tuo Express.js
```

## COLORI:
* marrone scurissimo: #423E37
* verde scuro: #8A9B68
* verde medio: #B6C197
* verde chiaro: #D5DDBC
* rosso figo: #D64933
- 
# TESTO
Su sfondi scuri (#423E37, #8A9B68): usa testo chiaro, preferibilmente #D5DDBC (grigio chiaro) o bianco.
Su sfondi chiari (#B6C197, #D5DDBC): usa testo scuro, come #423E37.
423E37 (grigio scuro): Sfondo principale del sito (body), per dare profondità e far risaltare gli altri colori.
# ELEMENTI
8A9B68 (verde oliva): Elementi di navigazione, bottoni primari, hover su link, dettagli importanti.
B6C197 (verde chiaro): Sfondo di card, box, sezioni secondarie, oppure come colore di testo su sfondo scuro.
D5DDBC (grigio chiaro): Sfondo di aree molto neutre, bordi, separatori, testo secondario.
D64933 (rosso/arancione): Colore di accento per azioni importanti (bottoni call-to-action, alert, badge, icone attive).

## RISOLUZIONI DA TESTARE
* Mobile (360x640, 375x812) ❌
* Tablet (768x1024) ❌
* Desktop (1280x720, 1920x1080) ❌
