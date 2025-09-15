// Configurazione Database per Monkey Rider
// 
// EDUCATIONAL NOTES:
// - Utilizziamo PostgreSQL per caratteristiche enterprise
// - Credenziali corrispondono al docker-compose.yml
// - Timeout aumentato per stabilità in ambiente development

const config = {
    db: {
      host: "localhost",         // PostgreSQL in container, accessibile via localhost
      port: 5432,               // Porta standard PostgreSQL
      user: "monkey_dev",       // Username definito in docker-compose
      password: "monkey123",    // Password definita in docker-compose  
      database: "monkeyrider",  // Nome database definito in docker-compose
      connectTimeout: 60000,
      // Configurazioni aggiuntive per PostgreSQL
      ssl: false,               // No SSL in development
      max: 10,                  // Pool massimo di connessioni
      idleTimeoutMillis: 30000  // Timeout per connessioni idle
    },
    
    // Configurazioni server Express
    server: {
      port: process.env.PORT || 3000,
      cors: {
        origin: "http://localhost:4200", // Frontend Angular
        credentials: true
      }
    }
  };

  module.exports = config;
