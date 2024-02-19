const httpErrors = require('http-errors');
const userServices = require('../services/userService');
const {authConfig} = require('../config/authConfig');

async function createUser(req,res,next){
    try {
        const signupPayload = {
            userName: req.body.username,
            mailId: req.body.mailid,
            password: req.body.password
        } 
        const userServicesRes = await userServices.createUser(signupPayload);
        return res.send(userServicesRes);
    } catch (err) {
        const signupError = httpErrors(401, 'Unauthorized : User Registration failed!');
        next(signupError)
    }
}

async function loginUser(req,res,next){
    try {
        const loginPayload = {
            mailId: req.body.mailid,
            password: req.body.password
        }
        const userServicesRes = await userServices.loginUser(loginPayload);
        const { refreshToken, accessToken } = await userServices.generateTokens(userServicesRes.user_id);
        await userServices.saveToken(userServicesRes.user_id, refreshToken)
        res.cookie('rtoken', refreshToken, { httpOnly: true, maxAge: authConfig.cookieExpiry.maxAge });
        res.send({refreshToken, accessToken})
    } catch (error) {
        const loginError = httpErrors(401, 'Unauthorized : User Login failed!');
        next(loginError)
    }
}

async function logoutUser(req, res, next) {
    try {
        const logout = await userServices.logoutUser(req.user)
        res.clearCookie('jwt')
        return res.send(logout)
    } catch (err) {
        console.log(err)
        const logoutError = httpErrors(401, 'Unauthorized : logout failed!');
        next(logoutError)
    }
}

module.exports = {
    loginUser,createUser,logoutUser
}