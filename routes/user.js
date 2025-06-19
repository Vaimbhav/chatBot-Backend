const express = require('express');
const passport = require('passport');
const {
	fetchUserById,
	updateUser,
	createUser,
	loginUser,
	logOutUser,
	checkAuth,
	resetPasswordRequest,
	resetPassword,
	fetchAllUsers,
} = require('../controllers/user');
const {isAuth} = require('../common');
const router = express.Router();

router.get('/all', fetchAllUsers);
router.get('/own', isAuth(), fetchUserById);
router.patch('/:id', updateUser);
router.post('/signup', createUser);
router.post('/login', passport.authenticate('local'), loginUser);
router.get('/logout', logOutUser);
router.get('/check', passport.authenticate('jwt'), checkAuth);
router.post('/reset-password-request', resetPasswordRequest);
router.post('/reset-password', resetPassword);

module.exports = router;
