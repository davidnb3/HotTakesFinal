const Sauce = require('../models/sauce');
const fs = require('fs');


exports.getAllSauces = (req, res, next) => {
    Sauce.find().then((sauces) => {
        res.status(200).json(sauces);
    }).catch((error) => {
        res.status(400).json({error: error});
    });
};


exports.getOneSauce = (req, res, next) => {
    // Get one sauce by it's ID
    Sauce.findOne({_id: req.params.id}).then((sauce) => {
        res.status(200).json(sauce);
    }).catch((error) => {
        res.status(404).json({error: error});
    });
};


exports.createSauce = (req, res, next) => {
    //Parse form data inside request body
    req.body.sauce = JSON.parse(req.body.sauce);
    // Create URL for image file
    const url = req.protocol + '://' + req.get('host');
    // Create new sauce with from data inside request body
    const sauce = new Sauce({
        userId: req.body.sauce.userId,
        name: req.body.sauce.name,
        manufacturer: req.body.sauce.manufacturer,
        description: req.body.sauce.description,
        mainPepper: req.body.sauce.mainPepper,
        imageUrl: url + '/images/' + req.file.filename,
        heat: req.body.sauce.heat,
        likes: req.body.sauce.likes,
        dislikes: req.body.sauce.dislikes
    });
    sauce.save().then(() => {
        res.status(201).json({message: 'Sauce added successfully!'});
    }).catch((error) => {
        res.status(400).json({error: error});
    });
};


exports.modifySauce = (req, res, next) => {
    // Create new sauce outside IF statement
    let sauce = new Sauce({_id: req.params.id});
    // Create URL for image file
    let url = req.protocol + '://' + req.get('host');
    // If there is a new images file, use new URL
    // Keep the same id
    if (req.file) {
        req.body.sauce = JSON.parse(req.body.sauce);
        sauce = {
            _id: req.params.id,
            userId: req.body.sauce.userId,
            name: req.body.sauce.name,
            manufacturer: req.body.sauce.manufacturer,
            description: req.body.sauce.description,
            mainPepper: req.body.sauce.mainPepper,
            imageUrl: url + '/images/' + req.file.filename,
            heat: req.body.sauce.heat,
        }
        // If no new image file, just use new form data
    } else {
        sauce = {
            _id: req.params.id,
            userId: req.body.userId,
            name: req.body.name,
            manufacturer: req.body.manufacturer,
            description: req.body.description,
            mainPepper: req.body.mainPepper,
            heat: req.body.heat,
        }
    };
    Sauce.updateOne({_id: req.params.id}, sauce).then(() => {
        res.status(201).json({message: 'Sauce updated successfully!'});
    }).catch((error) => {
        res.status(400).json({error: error});
    });
};


exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id}).then((sauce) => {
        // If there is an image file, delete image + sauce
        if (sauce.imageUrl) {
            const fileName = sauce.imageUrl.split('/images/')[1];
            fs.unlink('images/' + fileName, () => {
                Sauce.deleteOne({_id: req.params.id}).then(() => {
                    res.status(200).json({message: 'Deleted.'});
                }).catch((error) => {
                    res.status(400).json({error: error});
                });
            });
            // If there is no image file, don't look for image and just delete sauce
        } else {
            Sauce.deleteOne({_id: req.params.id}).then(() => {
                res.status(200).json({message: 'Deleted.'});
            }).catch((error) => {
                res.status(400).json({error: error});
            });
        }
    });
};

exports.setLikeStatus = (req, res, next) => {
    Sauce.findOne({_id: req.params.id}).then((sauce) => {
        const userId = req.body.userId;

        // Create arrays for userID's if they don't exist yet
        if (sauce.usersLiked === null) {
            sauce.usersLiked = [];
        }
        if (sauce.usersDisliked === null) {
            sauce.usersDisliked = [];
        }

        checkLikeStatus(req, sauce, userId);

        // Check request body before updating database
        if (req.body.like === 1 || req.body.like === -1 || req.body.like === 0) {
            Sauce.updateOne({_id: req.params.id}, sauce).then(() => {
                res.status(201).json({message : 'Like status updated!'});
            }).catch((error) => {
                res.status(400).json({error: error});
            });
        } else {
            res.status(400).send(new Error('Bad Request.'));
        };
    }).catch((error) => {
        res.status(400).json({error: error});
    });
};


function checkLikeStatus(req, sauce, userId) {
    // Check number inside request body
    switch (req.body.like) {
        // If 1, add one like + add userID to like array
        case 1:
            sauce.likes++;
            sauce.usersLiked.push(userId);
            break;
        // If 0, check if userID is either inside like or dislike array. Then remove like/dislike
        case 0:
            if (sauce.usersLiked.find(() => userId === userId)) {
                sauce.likes--;
                for (let i = 0; i < sauce.usersLiked.length; i++) {
                    if (sauce.usersLiked[i] === userId) {
                        sauce.usersLiked.splice(i, 1);
                    };
                };
            };
            if (sauce.usersDisliked.find(() => userId === userId)) {
                sauce.dislikes--;
                for (let i = 0; i < sauce.usersDisliked.length; i++) {
                    if (sauce.usersDisliked[i] === userId) {
                        sauce.usersDisliked.splice(i, 1);
                    };
                };
            };
            break;
        // If -1, add one dislike + add userID to dislike array
        case -1:
            sauce.dislikes++;
            sauce.usersDisliked.push(userId);
            break;
    };
};
