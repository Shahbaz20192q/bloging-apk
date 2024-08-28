const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const adminLayout = '../views/layouts/admin';
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

// admin login middleware
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized' })
    }
};

// admin login page
router.get('/admin', async (req, res) => {
    try {
        const locals = {
            title: "Admin",
            description: "Simple blog created with node js"
        }

        res.render('admin/index', { locals, layout: adminLayout });
    } catch (error) {
        console.log(error);
    }
});

// post/  admin chech login

router.post('/admin', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }

        const token = jwt.sign({ userId: user._id }, jwtSecret);
        res.cookie('token', token, { httpOnly: true });

        res.redirect('/dashboard')
    } catch (error) {
        console.log(error);
    }
});


// post/  admin Register

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const user = await User.create({
                username,
                password: hashedPassword
            });
            res.status(201).json({ message: "user Craeted", user })
        } catch (error) {
            if (error.code === 11000) {
                res.status(409).json({ message: 'User Already register' })
            }
            res.status(500).json({ message: 'Internal server error' });
        }

        res.redirect('/admin');
    } catch (error) {
        console.log(error);
    }
});


// get/ dashboard

router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Dashboard",
            description: "Simple blog created with node js"
        }
        const data = await Post.find();
        res.render('admin/dashboard', {
            locals,
            data,
            layout: adminLayout
        });
    } catch (error) {
        console.log(error);
    }
});

// dashboard admin new post

router.get('/add-post', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Add Post",
            description: "Simple blog created with node js"
        }
        const data = await Post.find();
        res.render('admin/add-post', {
            locals,
            layout: adminLayout
        });
    } catch (error) {
        console.log(error);
    }
});

// dashboard post/ admin new post

router.post('/add-post', authMiddleware, async (req, res) => {
    try {
        try {
            const newPost = new Post({
                title: req.body.title,
                body: req.body.body
            })
            await Post.create(newPost);
            res.redirect('/dashboard');
        } catch (error) {
            console.log(error);
        }

    } catch (error) {
        console.log(error);
    }
});

// dashboard get post/ admin new post

router.get('/edit-post/:id', authMiddleware, async (req, res) => {
    try {

        const locals = {
            title: "Edit Post",
            description: "Simple blog created with node js"
        }
        const data = await Post.findOne({ _id: req.params.id });

        res.render("admin/edit-post", {
            data,
            locals,
            layout: adminLayout
        })
    } catch (error) {
        console.log(error);
    }
});

// dashboard post/ admin Edit post

router.put('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            updatedAT: Date.now()
        })

        res.redirect(`/edit-post/${req.params.id}`)
    } catch (error) {
        console.log(error);
    }
});

// dashboard post/ admin Delete post

router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
    try {
        await Post.deleteOne({ _id: req.params.id })

        res.redirect('/dashboard')
    } catch (error) {
        console.log(error);
    }
});

// dashboard post/ admin Logout

router.get('/logout', (req,res,next) =>{
    res.clearCookie('token');

    // res.json({message:"Logout Successful"})
    res.redirect('/')
})

module.exports = router