const fetch = require('node-fetch');
const Chat = require('../models/chat');

exports.chatWithModel = async (req, res) => {
	// console.log('Chat request body:', req.body);
	const {text = '', prompt = ''} = req.body;
	// if (!text) {
	// 	return res.status(400).json({error: 'Text is required'});
	// }

	try {
		const data = `${prompt}\nUser: ${text}\nAI:`;

		const aiRes = await fetch(
			'https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1',
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${process.env.HF_API_KEY}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({inputs: data}),
			}
		);

		if (!aiRes.ok) {
			const errorText = await aiRes.text();
			return res
				.status(500)
				.json({error: 'Model Error', details: errorText});
		}

		const aiData = await aiRes.json();
		const reply =
			aiData[0]?.generated_text?.split('AI:')[1]?.trim() || 'No response';

		// console.log('AI reply:', reply);

		await Chat.create({
			user: req.user.id, // or _id
			prompt: prompt,
			text,
			reply,
		});

		const doc = {
			prompt,
			reply,
		};

		res.json(doc);
	} catch (err) {
		console.error('Chat error:', err);
		res.status(500).json({error: 'Server error', details: err.message});
	}
};

// ? -> chat without pagination
exports.getUserChatHistory = async (req, res) => {
	try {
		const chats = await Chat.find({user: req.user.id}).sort({
			createdAt: -1,
		});
		res.json({chats});
	} catch (err) {
		console.error('History fetch error:', err);
		res.status(500).json({error: 'Could not fetch chat history'});
	}
};

// ? ->  chat with pagination

// exports.getChatHistory = async (req, res) => {
// 	try {
// 		const userId = req.user.id;
// 		const page = parseInt(req.query.page) || 1;
// 		const limit = parseInt(req.query.limit) || 10;
// 		const skip = (page - 1) * limit;

// 		const chats = await Chat.find({user: userId})
// 			.sort({createdAt: -1})
// 			.skip(skip)
// 			.limit(limit);

// 		const total = await Chat.countDocuments({user: userId});

// 		res.json({
// 			page,
// 			totalPages: Math.ceil(total / limit),
// 			totalChats: total,
// 			chats,
// 		});
// 	} catch (error) {
// 		console.error('Error fetching chat history:', error);
// 		res.status(500).json({error: 'Internal server error'});
// 	}
// };

// TODO:  Usage (Frontend or Postman):  GET /api/v1/chat/history?page=1&limit=10 , Authorization: Bearer <your-token>
