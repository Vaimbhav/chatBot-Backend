const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		prompt: {
			type: String,
		},
		text: {
			type: String,
			default: '',
		},
		image: {
			type: String,
			default: '',
		},
		caption: {
			type: String,
		},
		reply: {
			type: String,
		},
	},
	{timestamps: true}
);

const virtual = chatSchema.virtual('id');
virtual.get(function () {
	return this._id;
});
chatSchema.set('toJSON', {
	virtuals: true,
	versionKey: false,
	transform: function (doc, ret) {
		delete ret._id;
	},
});

module.exports = mongoose.model('Chat', chatSchema);
