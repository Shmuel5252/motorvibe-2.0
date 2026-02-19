const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema(
    {
        lat: { type: Number, required: true, min: -90, max: 90 },
        lng: { type: Number, required: true, min: -180, max: 180 },
        label: {type: String, trim: true, maxlength: 80},
    },
    { _id: false }
);

const routeSchema = new mongoose.Schema(
    {
        owner: { type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: true, 
            index: true 
        },

        title: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },

        start: { type: pointSchema, required: true },
        end: { type: pointSchema, required: true },

        distanceKm: {type: Number},
        etaMinutes: {type: Number},
        polyline: {type: String},

        visibility: {
            type: String,
            enum: ['private', 'shared', 'friends'],
            default: 'private',
        },
    },
    { timestamps: true }
);
        
module.exports = mongoose.model('Route', routeSchema);