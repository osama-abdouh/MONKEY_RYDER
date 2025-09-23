// Servizio Supabase
// Inizializza il client Supabase per usarlo in tutto il backend
const { createClient } = require('@supabase/supabase-js');
const { SUPABASE_URL, SUPABASE_ANON_KEY } = require('../config');

// Il client è l'oggetto che userai per tutte le operazioni (query, auth, storage)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

module.exports = supabase;
