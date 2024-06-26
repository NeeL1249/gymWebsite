const mongoose = require('mongoose');

const ChallengeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    exercises: {
        type: Array,
        required: true
    },
    tile_image: {
        type: String,
        required: true
    }
});

const ChallengeModel = mongoose.model("challenge",ChallengeSchema);

module.exports = ChallengeModel;