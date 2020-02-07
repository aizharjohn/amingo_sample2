const express = require('express');
const router = express.Router();

const FeedModel = require('../../models/Feed');

router.get('/test', (req, res) => {
    res.send('Here are your feeds');
});

router.post('/create', async (req, res) => {
    const { description, image, hashtags, likes } = req.body;

    const feedData = {
        description,
        image,
        hashtags
    };

    const feed = new FeedModel(feedData);

    await feed.save();

    res.send('Feed Saved');
});

router.get('/all', (req, res) => {
    FeedModel.find().then(results => {
        res.json({
            msg: 'here are your results',
            results: results
        });
    });
});

module.exports = router;
