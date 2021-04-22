const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');


exports.signup = (req, res, next) => {
    // Hash password with bcrypt
    bcrypt.hash(req.body.password, 10).then((hash) => {
        const user = new User({
            email: req.body.email,
            password: hash
        });
        user.save().then(() => {
            res.status(201).json({message: 'User added successfully!'});
        }).catch((error) => {
            res.status(500).json({error: error});
        });
    }).catch((error) => {
        res.status(500).json({error: error});
    });
};

exports.login = (req, res, next) => {
    // Find user with email address
    User.findOne({email: req.body.email}).then((user) => {
        if (!user) {
            return res.status(401).json({error: new Error('User not found.')});
        }
        // Compare password inside request body with hashed password inside database
        bcrypt.compare(req.body.password, user.password).then((valid) => {
            if (!valid) {
                return res.status(401).json({error: new Error('Incorrect password!')});
            }
            // User gets authentification token
            const token = jwt.sign({userId: user._id}, '2BF529A61E9CB4EA9EF5AA6B28DE3AC488AC88593FB5DCB0F182067C4ACBC6FA', {expiresIn: '24h'});
            res.status(200).json({
                userId: user._id,
                token: token
            });
        }).catch((error) => {
            res.status(500).json({error: error});
        });
    }).catch((error) => {
        res.status(500).json({error: error});
    });
};