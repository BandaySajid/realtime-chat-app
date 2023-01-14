const User = require('../models/user');
const jwt = require('jsonwebtoken');

async function auth(req, res, next) {
    try {
        const token = req.cookies.token;
        if (!token) {
            throw new Error();
        }
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });
        if (!user) {
            res.clearCookie('token');
            throw new Error();
        }
        req.user = user;
        req.token = token;
        return next();
    }
    catch (err) {
        res.redirect('/login');
    }
};

async function redirectIfLoggedIn(req, res, next) {
    if(req.cookies.token){
        return res.redirect('/');
    }
    return next();
}

module.exports = {
    auth,
    redirectIfLoggedIn
};