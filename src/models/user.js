const mongoose = require('mongoose');
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const validator = require('validator');


const hashing = (valueToHash) => {
    const hash = crypto
        .createHash('sha256')
        .update(valueToHash)
        .digest('hex')
    return hash;
};

const compareHash = (value, hashedVal) => {
    return hashing(value) === hashedVal ? true : false;
}


const userSchema = new mongoose.Schema({ 
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate(value) {
            const invalid = '!@#$%^&*()-`~<>:"{}[]'

            const detected = invalid.split('').find((inv) => {
                if (value.includes(inv)) {
                    return true;
                }
                return false;
            });
            if (detected) {
                throw new Error(`Username cannot contain symbols like [${invalid}]`)
            }
        }
    },

    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('please provide a valid email');
            }
        }
    },

    password: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if (value.includes('password')) {
                throw new Error("password cannot contain 'password'");
            }
            if (value.length < 7) {
                throw new Error("minimum password length is 7 characters");
            }
        }
    },

    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ],

    joinedRooms : [
        {
            room : {
                type : String
            }
        }
    ]
    
}, {timestamps: true});

userSchema.virtual('ownedRooms', {
    ref: 'Room', 
    localField: '_id', 
    foreignField: 'owner'
});

userSchema.methods.toJSON = function () {
    const user = this;
    const profile = user.toObject();
    delete (profile.password);
    delete (profile.tokens);
    return profile;
};

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
    user.tokens = user.tokens.concat({ token: token });
    await user.save();
    return token;
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error("invalid user credentials");
    }

    const isMatch = await compareHash(password, user.password);
    if (!isMatch) {
        throw new Error("invalid user credentials");
    }
    return user;
};

userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await hashing(user.password);
    }
    next();
});


const User = mongoose.model('User', userSchema);

module.exports = User;