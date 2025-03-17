const express = require('express');
const bodyParser = require('body-parser');
const { getStoredPosts, storePosts } = require('./data/posts');

const app = express();
const PORT = process.env.PORT || 8080; // Support Render deployment

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Get all posts
app.get('/posts', async (req, res) => {
    const storedPosts = await getStoredPosts();
    res.json({ posts: storedPosts });
});

// Get a single post by ID
app.get('/posts/:id', async (req, res) => {
    const storedPosts = await getStoredPosts();
    const post = storedPosts.find((post) => post.id === req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ post });
});

// Add a new post
app.post('/posts', async (req, res) => {
    const existingPosts = await getStoredPosts();
    const postData = req.body;

    const newPost = {
        ...postData,
        id: Date.now().toString() // ✅ Use timestamp-based ID to prevent mismatch
    };

    const updatedPosts = [newPost, ...existingPosts];
    await storePosts(updatedPosts);
    res.status(201).json({ message: 'Stored new post.', post: newPost });
});

// Edit a post (FIXED)
app.put('/posts/:id', async (req, res) => {
    const storedPosts = await getStoredPosts();
    const postIndex = storedPosts.findIndex((post) => post.id === req.params.id);

    if (postIndex === -1) {
        return res.status(404).json({ message: 'Post not found' });
    }

    // ✅ Ensure ID consistency
    storedPosts[postIndex] = {
        ...storedPosts[postIndex],
        body: req.body.body,
        author: req.body.author
    };

    await storePosts(storedPosts);
    res.json({ message: 'Post updated successfully.', post: storedPosts[postIndex] });
});

// Delete a post
app.delete('/posts/:id', async (req, res) => {
    const storedPosts = await getStoredPosts();
    const filteredPosts = storedPosts.filter((post) => post.id !== req.params.id);

    if (storedPosts.length === filteredPosts.length) {
        return res.status(404).json({ message: 'Post not found' });
    }

    await storePosts(filteredPosts);
    res.json({ message: 'Post deleted successfully' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
