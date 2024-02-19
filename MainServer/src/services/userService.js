const { userTable } = require('../model/userModel');
const {tokenTable} = require('../model/refreshTokenModel')
const bcrypt = require('bcrypt');
const {authConfig} = require('../config/authConfig');
const jwt = require('jsonwebtoken')
require('dotenv').config()


async function createUser(signupData){
    try {
        const {userName,mailId,password} = signupData
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const findUser = await userTable.findAll({
            where: {
              user_mail: mailId
            }
          });
          console.log(findUser.user_name);
          if(!findUser || findUser.length === 0){
            const addUser = await userTable.create({ 
                user_name: userName, 
                user_mail: mailId, 
                user_password : hashedPassword 
            });
            return { addUser }
            }
            throw new Error("user with same mail id exist!!")    
    } catch (err) {
        throw err
    }
}

async function loginUser(loginData){
    try {
        const {mailId,password} = loginData
        const findUser = await userTable.findOne({
            where : {
                user_mail:mailId,
            }
        })
        if(!findUser || findUser.length === 0){
            throw new Error("sorry user does not exist!!")
        }
        const isVerified = await bcrypt.compare(password, findUser.user_password);
        if(!isVerified){
            throw new Error("Incorrect Password!!!")
        }
        return(findUser)
    } catch (err) {
        throw err
    }
}

async function generateTokens(userId) {
    try {
        console.log(userId)
        const accessToken = jwt.sign(
            { userId },
            process.env.ACCESS_TOKEN_SECRET,
            // authConfig.secrets.accessToken,
            { expiresIn: authConfig.tokenExpiry.accessTokenExp }
        )
        const refreshToken = jwt.sign(
            { userId },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: authConfig.tokenExpiry.refreshTokenExp }
        )
        return { accessToken: accessToken, refreshToken: refreshToken }
    } catch (err) {
        console.log(err)
        throw err
    }
}

async function saveToken (userId,refreshToken){
    try {
        const user = await tokenTable.findOne({where : {user_id : userId}})
        if(!user || user.length === 0){
            const newUser = await tokenTable.create({
                user_id: userId,
                refresh_token : refreshToken
            })
        }
        user.refresh_token = refreshToken
        await user.save();
    } catch (error) {
        console.log(err)
        throw err
    }
}

async function logoutUser (userHeader){
    try {
        const user = await tokenTable.destroy({
            where: {
              user_id: userHeader.user_id
            },
          });
        if (!user || user.length === 0) {
            throw err
        }
        return (userHeader.user_name)
    } catch (err) {
        console.log(err)
        throw err
    }
}
module.exports = {
    createUser,loginUser,generateTokens, saveToken, logoutUser
}