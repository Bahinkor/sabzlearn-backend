const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    body: {
        type: String,
        required: true,
    },
    course: {
        type: mongoose.Types.ObjectId,
        ref: "Course",
        required: true,
    },
    creator: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },
    isAccept: {
        type: Boolean,
        default: false,
    },
    score: {
        type: Number,
        default: 5,
        min: 1,
        max: 5,
    },
    replays: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Replay",
        }
    ],
}, {timestamps: true});

const model = mongoose.models.Comment || mongoose.model("Comment", schema);

module.exports = model;