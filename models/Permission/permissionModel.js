const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
},
    {
        timestamps: true
    }
);


const permission = mongoose.model('Permission', permissionSchema);

module.exports = permission;
