CREATE TABLE utenti (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100),
    email VARCHAR(100)
);

INSERT INTO utenti (nome, email) VALUES
('Mario Rossi', 'mario.rossi@example.com'),
('Luca Bianchi', 'luca.bianchi@example.com');