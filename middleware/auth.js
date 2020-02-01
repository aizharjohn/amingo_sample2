const jwt = require('jsonwebtoken');
const config = require('config');

const secretToken = config.get('jwtSecret');
const noToken = config.get('notoken');
const tokenInvalid = config.get('tokeninvalid');

module.exports = (req, res, next) => {
    //Get token from header
    const token = req.header('x-auth-token');

    //Check if not token
    if (!token) {
        return res.status(401).json(noToken);
    }

    //Verify token
    try {
        const decoded = jwt.verify(token, secretToken);
        req.user = decoded.theUser;
        next();
    } catch (error) {
        res.status(401).json(tokenInvalid);
    }
};
