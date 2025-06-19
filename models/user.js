const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},
		password: {
			type: String,
			required: true,
		},
		addresses: {
			type: [mongoose.Schema.Types.Mixed],
		},
		name: {
			type: String,
			required: true,
			trim: true,
		},
		resetPasswordToken: {
			type: String,
			default: '',
		},
	},
	{
		timestamps: true,
	}
);

const virtual = userSchema.virtual('id');
virtual.get(function () {
	return this._id;
});
userSchema.set('toJSON', {
	virtuals: true,
	versionKey: false,
	transform: function (doc, ret) {
		delete ret._id;
	},
});

module.exports = mongoose.model('User', userSchema);
