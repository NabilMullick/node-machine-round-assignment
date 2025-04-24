const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for question count
categorySchema.virtual('questionCount', {
    ref: 'Question',
    localField: '_id',
    foreignField: 'categories',
    count: true
});

module.exports = mongoose.model('Category', categorySchema);