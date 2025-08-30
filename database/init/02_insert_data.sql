-- Dati di esempio per testare il sistema di autenticazione
-- Utente di test per sviluppo e debugging

-- Inserimento utente di test (password: "password123")
-- Hash generato con: bcrypt.hash("password123", 10)
INSERT INTO users (email, password, full_name) VALUES 
(
    'test@monkeyrider.com', 
    '$2b$10$CwTycUXWue0Thq9StjUM0uPd/H3qPSHvNwqf8qgm12OzC.9M5J3iq', 
    'Utente Test'
),
(
    'studente@unife.it',
    '$2b$10$CwTycUXWue0Thq9StjUM0uPd/H3qPSHvNwqf8qgm12OzC.9M5J3iq',
    'Studente Ferrara'
);

-- Query di verifica (per testare che i dati siano inseriti correttamente)
-- SELECT id, email, full_name, created_at FROM users;