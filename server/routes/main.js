const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// get home Route
router.get('', async (req, res, net) => {
    const locals = {
        title: "NodeJS Blog",
        description: "Simple blog created with node js"
    }

    try {

        let perPage = 4;
        let page = req.query.page || 1;

        const data = await Post.aggregate([{ $sort: { createdAT: -1 } }])
            .skip(perPage * page - perPage)
            .limit(perPage)
            .exec();
        const count = await Post.countDocuments();
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage)

        res.render('index',
            {
                locals,
                data,
                current: page,
                nextPage: hasNextPage ? nextPage : null,
                currentRoute: '/'
            });
    } catch (error) {
        console.log(error);
    }
});


// get Post:id Route

router.get('/post/:id', async (req, res, net) => {
    try {
        let slug = req.params.id;

        const data = await Post.findById({ _id: slug });
        const locals = {
            title: data.title,
            description: "Simple blog created with node js"
        }

        res.render('post', { locals, data, currentRoute: `/post/${slug}` });
    } catch (error) {
        console.log(error);
    }
});

// Post/ Post - search

router.post('/search', async (req, res) => {
    try {
        const locals = {
            title: "Search",
            description: "Simple blog created with node js"
        }

        let searchTerm = req.body.searchTerm
        const searchNoSpeacialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, "")

        const data = await Post.find({
            $or: [
                { title: { $regex: new RegExp(searchNoSpeacialChar, 'i') } },
                { body: { $regex: new RegExp(searchNoSpeacialChar, 'i') } }
            ]
        })
        res.render('search', { locals, data, currentRoute: '/search' });
    } catch (error) {
        console.log(error);
    }
});




router.get('/about', (req, res, net) => {
    res.render('about', {
        currentRoute: '/about'
    });
});

module.exports = router