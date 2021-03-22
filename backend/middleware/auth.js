const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, '2BF529A61E9CB4EA9EF5AA6B28DE3AC488AC88593FB5DCB0F182067C4ACBC6FA');
        const userId = decodedToken.userId;
        if (req.body.userId && req.body.userId !== userId) {
            throw 'Invalid User ID';
        } else {
            next();
        }
    } catch (error) {
        res.status(401).json({error: new Error('Invalid request.')});
    }
};