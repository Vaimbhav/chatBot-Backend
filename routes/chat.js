const express = require('express');
const {chatWithModel, getUserChatHistory} = require('../controllers/chat');

const router = express.Router();

router.post('/', chatWithModel);
router.get('/history', getUserChatHistory);

module.exports = router;
