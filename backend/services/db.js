const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

// Il client è l'oggetto che userai per tutte le operazioni (query, auth, storage)
const supabase = createClient(config.db.url, config.db.anonKey);

module.exports = supabase;