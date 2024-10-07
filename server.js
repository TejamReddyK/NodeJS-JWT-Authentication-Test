const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const exjwt = require('express-jwt');
const bodyParser = require('body-parser');
const path = require('path');

// Enable CORS for frontend (adjust this to your frontend URL)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 3000;
const secretKey = 'My super secret key';
const jwtMW = exjwt({  
    secret: secretKey,
    algorithms: ['HS256']
});

// Dummy users for login
let users = [
    {
        id: 1,
        username: 'tejam',
        password: '123'
    },
    {
        id: 2,
        username: 'reddy',
        password: '456'
    }
];

// Login route
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    for (let user of users) {
        if (username === user.username && password === user.password) {
            let token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '3m' }); // Set expiration to 3 minutes
            res.json({
                success: true,
                err: null,
                token
            });
            return;
        }
    }
    res.status(401).json({
        success: false,
        token: null,
        err: 'Username or password is incorrect'
    });
});

// Dashboard route - protected
app.get('/api/dashboard', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'Secret content that only logged-in people can see.'
    });
});

// New Settings route - protected
app.get('/api/settings', jwtMW, (req, res) => {
    res.json({
        success: true,
        settingsContent: 'This is the settings page. Only authorized users can see this.'
    });
});

// Serve index.html for protected routes on reload
app.get(['/dashboard', '/settings'], (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));  // Adjusted path to serve index.html correctly
});

// Serve static files from jwt directory
app.use(express.static(path.join(__dirname)));

// Catch-all route for serving index.html for client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({
            success: false,
            officialError: err,
            err: 'Unauthorized access'
        });
    } else {
        next(err);
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
