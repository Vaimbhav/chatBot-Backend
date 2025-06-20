const express = require('express');
const session = require('express-session');
const connectWithDb = require('./config/database');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const User = require('./models/user');

const {isAuth, sanitizeUser, cookieExtractor} = require('./common');

const userRouter = require('./routes/user');
const chatRouter = require('./routes/chat');

require('dotenv').config();

const PORT = process.env.PORT || 3000;

connectWithDb();

const server = express();

server.use(express.json());
server.use(cookieParser());
server.use(express.urlencoded({extended: true}));

server.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false, // don't save session if unmodified
		saveUninitialized: false, // don't create session until something stored
		// store: new SQLiteStore({ db: 'sessions.db', dir: './var/db' })
	})
);

server.use(passport.authenticate('session'));

const opts = {};
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = process.env.SECRET_KEY;

server.use(
	cors({
		origin: 'http://localhost:5173',
		credentials: true,
	})
);

server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

server.get('/', (req, res) => {
	res.send('Hello World!');
});

server.use('/api/v1/users', userRouter);

server.use('/api/v1/chat', isAuth(), chatRouter);

// Passport Methods

// Local strategy

passport.use(
	'local',
	new LocalStrategy(
		{usernameField: 'email'},
		async (email, password, done) => {
			// console.log('here-local');
			// console.log('email- ', email, password);

			try {
				const user = await User.findOne({email}).exec();
				// console.log('user is -> ', user);

				if (!user) {
					return done(null, false, {message: 'User Not Registered'});
				}

				const isMatch = await bcrypt.compare(password, user.password);
				// console.log('Password match:', isMatch);

				if (isMatch) {
					const token = jwt.sign(
						sanitizeUser(user),
						process.env.SECRET_KEY
					);

					return done(
						null,
						{
							id: user.id,
							name: user.name,
							email: user.email,
							token,
						},
						{message: 'Logged in Successfully'}
					);
				} else {
					return done(null, false, {message: 'Invalid Credentials'});
				}
			} catch (err) {
				console.error('Error in passport-local strategy:', err);
				return done(err);
			}
		}
	)
);

passport.use(
	'jwt',
	new JwtStrategy(opts, async function (jwt_payload, done) {
		try {
			const user = await User.findById(jwt_payload.id);
			if (user) {
				return done(null, sanitizeUser(user));
			} else {
				return done(null, false);
				// or you could create a new account
			}
		} catch (err) {
			return done(err, false);
		}
	})
);

passport.serializeUser(function (user, cb) {
	// console.log('serialise- ', user);
	process.nextTick(function () {
		return cb(null, sanitizeUser(user));
	});
});

passport.deserializeUser(async function (user, cb) {
	const userInfo = await User.findById(user.id);
	// console.log('deserialise- ', userInfo);
	process.nextTick(function () {
		return cb(null, userInfo);
	});
});

// server.post('/api/v1/chat', async (req, res) => {
// 	const {text = '', prompt = ''} = req.body;

// 	try {
// 		const promptStr = `${prompt}\nUser: ${text}\nAI:`;
// 		console.log('Final Prompt ->', promptStr);

// 		const chatRes = await fetch(
// 			'https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1',
// 			{
// 				method: 'POST',
// 				headers: {
// 					Authorization: `Bearer ${process.env.HF_API_KEY}`,
// 					'Content-Type': 'application/json',
// 				},
// 				body: JSON.stringify({inputs: promptStr}),
// 			}
// 		);

// 		if (!chatRes.ok) {
// 			const errText = await chatRes.text();
// 			return res
// 				.status(500)
// 				.json({error: 'Model API Error', details: errText});
// 		}

// 		const chatData = await chatRes.json();
// 		const reply =
// 			chatData[0]?.generated_text?.split('AI:')[1]?.trim() ||
// 			'No response';

// 		res.json({reply});
// 	} catch (error) {
// 		console.error('Chat error:', error);
// 		res.status(500).json({error: 'Server error', details: error.message});
// 	}
// });
