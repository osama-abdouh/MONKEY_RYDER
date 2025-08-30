-- Script di inizializzazione database Monkey Rider
-- Tabelle essenziali per sistema di autenticazione
-- Progetto per esame "Ingegneria dei Sistemi Web" - Università di Ferrara

-- Tabella utenti registrati (core dell'autenticazione)
CREATE TABLE users (
    -- Chiave primaria auto-incrementale (PostgreSQL SERIAL = AUTO_INCREMENT MySQL)
    id SERIAL PRIMARY KEY,
    
    -- Email come username (vincolo di unicità per prevenire duplicati)
    email VARCHAR(255) UNIQUE NOT NULL,
    
    -- Password hashata con bcrypt (mai salvare password in chiaro!)
    -- VARCHAR(255) è sufficiente per hash bcrypt ($2b$10$...)
    password VARCHAR(255) NOT NULL,
    
    -- Nome completo dell'utente (opzionale ma utile)
    full_name VARCHAR(255),
    
    -- Timestamp di registrazione (utile per analytics e debugging)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Timestamp ultimo aggiornamento profilo
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indice su email per ottimizzare le query di login
-- PostgreSQL crea automaticamente indice su PRIMARY KEY e UNIQUE
CREATE INDEX idx_users_email ON users(email);

-- Commenti educativi per l'esame (PostgreSQL supporta commenti su tabelle)
COMMENT ON TABLE users IS 'Tabella utenti per sistema di autenticazione Monkey Rider';
COMMENT ON COLUMN users.email IS 'Email utilizzata come username per il login';
COMMENT ON COLUMN users.password IS 'Password hashata con bcrypt (fattore costo 10)';
COMMENT ON COLUMN users.created_at IS 'Timestamp registrazione utente';

-- Verifica creazione tabella (query di test)
-- Questa riga non viene eseguita, è solo un promemoria per testare
-- SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_name = 'users';