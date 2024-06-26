const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    features: {
        type: Array,
        required: true
    },
    tile_image: {
        type: String,
        required: true
    }
});

const PlanModel = mongoose.model("plan",PlanSchema);

module.exports = PlanModel;