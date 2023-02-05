const mongoose = require('mongoose');

const data = new mongoose.Schema({
    // categoryType: String,
    date: Date,
    dateString: String,
    value: {
        heartRateZones: [
            {
                caloriesOut: Number,
                max: Number,
                min: Number,
                minutes: Number,
                name: String
            }
        ],
        restingHeartRate: {
            type: Number,
            default: 0
        }
    },
    
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
},
{
    timestamps: true
}
);


const Data = mongoose.model('HeartDataModel', data);

module.exports = Data;
