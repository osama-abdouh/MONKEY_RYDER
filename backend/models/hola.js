//models/user.js
const mongoose = require('mongoose')
const Joi = require('joi');
const db = require('../services/db');  // Importa il pool DB
const bcrypt = require('bcrypt');

// Schema di validazione con Joi (uguale)
function validateUser(user) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(100).required(),  // Nota: nella tabella è 'username', non 'name'
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(8).max(100).required()
    });
    return schema.validate(user);
}

// Classe User per interagire con la tabella UTENTE (PostgreSQL)
class User {
    // Crea un nuovo utente
    static async create(userData) {
        const { name, email, password } = userData;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const query = `
            INSERT INTO utente (username, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING id_utente, username, email, created_at
        `;
        const result = await db.query(query, [name, email, hashedPassword]);
        return result[0];  // Restituisci l'utente creato
    }

    // Trova utente per email
    static async findByEmail(email) {
        const query = `
            SELECT id_utente, username, email, password_hash, created_at
            FROM utente
            WHERE email = $1
        `;
        const result = await db.query(query, [email]);
        return result[0] || null;  // Restituisci il primo risultato o null
    }

    // Trova utente per ID
    static async findById(id) {
        const query = `
            SELECT id_utente, username, email, created_at
            FROM utente
            WHERE id_utente = $1
        `;
        const result = await db.query(query, [id]);
        return result[0] || null;
    }

    // Verifica password (metodo di istanza)
    async checkPassword(password) {
        return await bcrypt.compare(password, this.password_hash);
    }
}

module.exports.validate = validateUser;
module.exports.User = User;