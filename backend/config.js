require('dotenv').config();

const config={
	db:{
		url: process.env.SUPABASE_URL,
		anonKey: process.env.SUPABASE_ANON_KEY
	}
}; 

module.exports = config;
