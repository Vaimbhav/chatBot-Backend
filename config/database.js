const mongoose = require('mongoose');
require('dotenv').config();

const connectWithDb = async () => {
	try {
		await mongoose.connect(process.env.DATABASE_URL);
		console.log('Connected to database');
	} catch (error) {
		console.error('Error connecting to database:', error);
		process.exit(1);
	}
};

module.exports = connectWithDb;
