const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    messages: [
        {
            message: {
                type: Object,
            },
            createdAt: {
                type: Date,
                expires: 20, // expires in 30 seconds
                default: Date.now
            }
        }
    ],

    roomId: {
        type: String,
        lowercase: true,
        trim: true,
        ref: 'Room',
        required: true,
    }
}, { timestamps: true });

messageSchema.methods.saveMessageToRoom = async function (messageInfo) {
    const messageRoom = this;
    messageRoom.messages = messageRoom.messages.concat({ message: { ...messageInfo, timestamp: new Date(new Date().getTime()) } });
    await messageRoom.save();
    return messageRoom;
}

const Message = mongoose.model('Message', messageSchema);

setInterval(() => {
    Message.updateMany({}, { $pull: { messages: { createdAt: { $lt: (new Date(Date.now() - 43200*1000)) } } } }, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Expired messages removed');
        }
    });
}, 43200);

module.exports = Message;