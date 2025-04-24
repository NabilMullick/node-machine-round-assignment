const express = require('express');
const router = express.Router();
const { Question, Answer } = require('../models/Question');
const auth = require('../middleware/auth');
const { uploadCSV } = require('../middleware/upload');
const { parse } = require('csv-parse');
const fs = require('fs');

// Get questions by category
router.get('/category/:categoryId', auth, async (req, res) => {
    try {
        const questions = await Question.find({
            categories: req.params.categoryId
        }).populate('categories', 'name');
        res.json(questions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Import questions from CSV
router.post('/import', auth, uploadCSV, async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Please upload a CSV file' });
    }

    try {
        const questions = [];
        fs.createReadStream(req.file.path)
            .pipe(parse({ columns: true, trim: true }))
            .on('data', (row) => {
                const options = row.options.split('|').map(opt => {
                    const [text, isCorrect] = opt.split(';');
                    return { text, isCorrect: isCorrect === 'true' };
                });

                questions.push({
                    text: row.text,
                    options,
                    categories: row.categories.split('|')
                });
            })
            .on('end', async () => {
                await Question.insertMany(questions);
                fs.unlinkSync(req.file.path); // Clean up uploaded file
                res.status(201).json({ message: `Imported ${questions.length} questions` });
            })
            .on('error', (error) => {
                fs.unlinkSync(req.file.path); // Clean up on error
                res.status(400).json({ error: error.message });
            });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(400).json({ error: error.message });
    }
});

// Submit answer
router.post('/:questionId/answer', auth, async (req, res) => {
    try {
        const answer = new Answer({
            user: req.user._id,
            question: req.params.questionId,
            selectedOption: req.body.selectedOption,
            submittedAt: new Date()
        });
        await answer.save();
        res.status(201).json(answer);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Search questions with user answers
router.get('/search', auth, async (req, res) => {
    try {
        const { query } = req.query;
        const questions = await Question.aggregate([
            {
                $match: {
                    text: { $regex: query, $options: 'i' }
                }
            },
            {
                $lookup: {
                    from: 'answers',
                    let: { questionId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$question', '$$questionId'] },
                                        { $eq: ['$user', req.user._id] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'userAnswers'
                }
            },
            {
                $project: {
                    text: 1,
                    options: 1,
                    categories: 1,
                    userAnswer: { $arrayElemAt: ['$userAnswers', 0] }
                }
            }
        ]);
        res.json(questions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;