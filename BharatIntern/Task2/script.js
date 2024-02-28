const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

// Replace with your actual MongoDB connection string
const mongoURI = 'mongodb://localhost:27017/your-blog-database-name';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(error => console.error('Error connecting to MongoDB:', error));

// Define the Post schema
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', PostSchema);

// Use body-parser for form data parsing
app.use(bodyParser.urlencoded({ extended: false }));

// Get all posts and render them dynamically in the HTML
app.get('/', (req, res) => {
    Post.find({}, (err, posts) => {
        if (err) {
            console.error('Error fetching posts:', err);
            return res.status(500).send('Error fetching posts');
        }

        let postsHTML = '';
        posts.forEach(post => {
            postsHTML += `
                <div class="post">
                    <h2>${post.title}</h2>
                    <p>${post.content}</p>
                    <p>Published: ${post.date.toLocaleDateString()}</p>
                </div>
            `;
        });

        const fullHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Awesome Blog</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <h1>My Awesome Blog</h1>
    </header>
    <main>
        <section id="posts">
            ${postsHTML}
        </section>
        <section id="new-post">
            <h2>Write a New Post</h2>
            <form id="post-form">
                <label for="title">Title:</label>
                <input type="text" id="title" name="title" required>
                <br>
                <label for="content">Content:</label>
                <textarea id="content" name="content" rows="10" required></textarea>
                <br>
                <button type="submit">Submit Post</button>
            </form>
        </section>
    </main>
    <script src="script.js"></script>
</body>
</html>
        `;

        res.send(fullHTML);
    });
});

// Handle form submission for creating a new post
app.post('/post', (req, res) => {
    const { title, content } = req.body;

    const newPost = new Post({ title, content });

    newPost.save()
        .then(() => {
            console.log('Post created successfully!');
            res.redirect('/'); // Redirect to home page after successful creation
        })
        .catch(error => {
            console.error('Error creating post:', error);
            res.status(500).send('Error creating post');
        });
});

const port = process.env.PORT || 3000; // Use environment variable or default port

app.listen(port, () => console.log(`Server listening on port ${port}`));
