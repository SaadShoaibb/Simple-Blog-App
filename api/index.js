const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });
const fs = require('fs');

const salt = bcrypt.genSaltSync(10);
const secret = 'asdfe45we45w345wegw345werjktjwertkj';

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

mongoose.connect('mongodb+srv://blog:blog7745@blog.kdcba.mongodb.net/?retryWrites=true&w=majority&appName=blog');

//for registering a user
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userDoc = await User.create({
            username,
            password: bcrypt.hashSync(password, salt),
        });
        res.json(userDoc);
    } catch (e) {
        console.log(e);
        res.status(400).json(e);
    }
});

//registered user in database can login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const userDoc = await User.findOne({ username });
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
        // logged in
        jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
            if (err) throw err;
            res.cookie('token', token).json({
                id: userDoc._id,
                username,
            });
        });
    } else {
        res.status(400).json('wrong credentials');
    }
});

app.get('/profile', (req, res) => {
    const { token } = req.cookies;
    jwt.verify(token, secret, {}, (err, info) => {
        if (err) throw err;
        res.json(info);
    });
});

app.post('/logout', (req, res) => {
    res.cookie('token', '').json('ok');
});

//blog post create krke database ma dalne ka route
app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
    const { originalname, path } = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = path + '.' + ext;
    fs.renameSync(path, newPath);

    const { token } = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
        if (err) throw err;
        const { title, summary, content } = req.body;
        const postDoc = await Post.create({
            title,
            summary,
            content,
            cover: newPath,
            author: info.id,
        });
        res.json(postDoc);
    });

});


//Post edit krne keliye route
app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
    let newPath = null;

    if (req.file) {
        const { originalname, path } = req.file;
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        newPath = path + '.' + ext;
        fs.renameSync(path, newPath);
    }

    const { token } = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
        if (err) throw err;

        const { id, title, summary, content } = req.body;
        const postDoc = await Post.findById(id);

        const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
        if (!isAuthor) {
            return res.status(400).json('you are not the author');
        }

        postDoc.title = title;
        postDoc.summary = summary;
        postDoc.content = content;
        postDoc.cover = newPath ? newPath : postDoc.cover;

        await postDoc.save();

        res.json(postDoc);
    });
});

// Route to delete a blog post
app.delete('/post/:id', async (req, res) => {
    const { token } = req.cookies;

    jwt.verify(token, secret, {}, async (err, info) => {
        if (err) {
            return res.status(401).json('Unauthorized');
        }

        const { id } = req.params;

        try {
            const postDoc = await Post.findById(id);
            if (!postDoc) {
                return res.status(404).json('Post not found');
            }

            // To ensure the logged-in user is the author
            const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
            if (!isAuthor) {
                return res.status(403).json('You are not authorized to delete this post');
            }

            // Removes the associated file
            if (postDoc.cover) {
                fs.unlinkSync(postDoc.cover); // Deletes the file
            }

            // Post database se delete krne kelie
            await Post.deleteOne({ _id: id });

            res.json({ message: 'Post deleted successfully' });
        } catch (e) {
            console.error(e);
            res.status(500).json('Internal Server Error');
        }
    });
});



//blog post database se nikalke show krne keliye, latest shown first
app.get('/post', async (req, res) => {
    res.json(
        await Post.find()
            .populate('author', ['username'])
            .sort({ createdAt: -1 })
            .limit(20)
    );
});

//for each individual posts
app.get('/post/:id', async (req, res) => {
    const { id } = req.params;
    const postDoc = await Post.findById(id).populate('author', ['username']);
    res.json(postDoc);
})

//route for comments on posts to to database
app.post('/post/:id/comment', async (req, res) => {
    const { token } = req.cookies;

    jwt.verify(token, secret, {}, async (err, info) => {
        if (err) {
            return res.status(401).json('Unauthorized');
        }

        const { id } = req.params;
        const { text } = req.body;

        try {
            // Find the post by ID
            const postDoc = await Post.findById(id);
            if (!postDoc) {
                return res.status(404).json('Post not found');
            }

            // Add the comment to the post
            postDoc.comments.push({
                text,
                author: info.id,
                createdAt: new Date(),
            });

            await postDoc.save();

            res.json(postDoc);
        } catch (e) {
            console.error(e);
            res.status(500).json('Internal Server Error');
        }
    });
});

//route to get ffrom database and display comment 
app.get('/post/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const postDoc = await Post.findById(id)
            .populate('author', ['username']) 
            .populate('comments.author', ['username']) 

        if (!postDoc) {
            return res.status(404).json('Post not found');
        }

        res.json(postDoc); 
    } catch (e) {
        console.error(e);
        res.status(500).json('Internal Server Error');
    }
});



app.listen(4000);
//

