const mongoose = require('mongoose')

const ProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    university: {
        type: String
    },
    degree: {
        type: String
    },
    location: {
        type: String
    },
    status: {
        type: String,
    },
    skills: {
        type: [String],
    },
    social: {
        youtube: {
            type: String
        },
        twitter: {
            type: String
        },
        facebook: {
            type: String
        },
        linkedin: {
            type: String
        },
        github: {
            type: String
        },
        instagram: {
            type: String
        }
    },
    date: {
        type: Date,
        default: Date.now
    }

})


module.exports = Profile = mongoose.model('profile', ProfileSchema)