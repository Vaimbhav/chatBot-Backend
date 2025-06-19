const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.checkAuth = async (req, res, next) => {
	const token =
		req.body.token ||
		req.cookies.token ||
		req.header('Authorization').replace('Bearer ', '');
	try {
		const payload = jwt.verify(token, process.env.SECRET_KEY);
		// console.log('payload is -> ', payload);
		req.user = payload;
		return res.status(200).json({
			success: true,
			payload,
			message: 'User Verified',
		});
		next();
	} catch (error) {
		return res.status(400).json({
			error: error.message,
			message: 'User Not Verified',
		});
	}
};
