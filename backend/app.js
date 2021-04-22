const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs')
const imageDir = './images';

const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');

const app = express();

// Connects to MongoDB database
mongoose.connect('mongodb+srv://AppUser:hsKZg7I1KhQqLxxT@sopeckoko.v7tlb.mongodb.net/test?retryWrites=true&w=majority')
    .then(() => {
        console.log('Succesfully connected to MongoDB Atlas!');
    })
    .catch((error) => {
        console.log('Unable to connect to MongoDB Atlas.');
        console.error(error);
    });

// Set which headers and methods are allowed
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(bodyParser.json());

// Create image folder when running up server
if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir);
};

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);

module.exports = app;