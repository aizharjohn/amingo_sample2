const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    occupation: {
        type: String,
        default: 'Unspecified'
        //required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const UserModel = mongoose.model('user', UserSchema);

module.exports = UserModel;
