const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const auth = require('../middleware/auth');

// Get all categories
router.get('/', auth, async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get categories with question count
router.get('/with-count', auth, async (req, res) => {
    try {
        const categories = await Category.aggregate([
            {
                $lookup: {
                    from: 'questions',
                    localField: '_id',
                    foreignField: 'categories',
                    as: 'questions'
                }
            },
            {
                $project: {
                    name: 1,
                    description: 1,
                    questionCount: { $size: '$questions' }
                }
            }
        ]);
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new category
router.post('/', auth, async (req, res) => {
    try {
        const category = new Category(req.body);
        await category.save();
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;