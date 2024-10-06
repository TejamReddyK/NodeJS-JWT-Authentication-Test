const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const exjwt = require('express-jwt');
const bodyParser = require('body-parser');
const path = require('path');

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
            return; // Exit the loop once token is created
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

// Default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve favicon.ico (optional)
app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'favicon.ico'));
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

// Server listening
app.listen(PORT, () => {
    console.log(`Serving on port ${PORT}`);
});
