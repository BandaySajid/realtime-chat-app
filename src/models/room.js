const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },

    roomUsers : [
        {
            user : {
                type : String
            }
        }
    ],

}, {timestamps: true});

roomSchema.virtual('messages', {
    ref: 'Message', 
    localField: 'roomId', 
    foreignField: 'roomId'
});

roomSchema.methods.saveUserToRoom = async function (username) {
    const room = this;
    room.roomUsers = room.roomUsers.concat({ user: username });
    await room.save();
    return username;
}

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;