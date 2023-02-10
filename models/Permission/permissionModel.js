const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    permitted: {
        type: Boolean,
        default: false
    }
},
    {
        timestamps: true
    }
);


const permission = mongoose.model('Permission', permissionSchema);

module.exports = permission;
