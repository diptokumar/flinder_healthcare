const mongoose = require('mongoose');

const data = new mongoose.Schema({
    categoryType: String,
    date: Date,
    dateString: String,
    value: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
},
{
    timestamps: true
}
);


const Data = mongoose.model('DataModel', data);

module.exports = Data;
