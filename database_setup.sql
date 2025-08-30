-- Script per creare la tabella users corretta per il backend
-- Esegui questo script in pgAdmin4

-- Prima elimina la vecchia tabella se esiste
DROP TABLE IF EXISTS UTENTE;

-- Crea la nuova tabella con la struttura che il backend si aspetta
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserisci un utente di test per verificare il login
INSERT INTO users (full_name, email, password) 
VALUES ('Test User', 'test@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');
-- Password: "password" (già hashata con bcrypt)
