const httpErrors = require('http-errors');
const productServices = require('../services/productServices')

async function registerProduct(req,res,next){
    try {
        const userId = req.user.user_id
        const userName = req.user.user_name
        const productCode = req.body.productCode
        console.log(req.body)
        const data = {userId , userName, productCode}
        const registeredProduct  = await productServices.registerProduct(data)
        return res.send(registeredProduct)
    } catch (error) {
        const productRegistrationError = httpErrors(400, 'This user cant register a product!!')
        next(productRegistrationError);
    }
}

async function removeProduct(req,res,next){
    try {
        const userId = req.user.user_id
        const removedProduct = await productServices.removeProduct(userId)
        return res.send(removedProduct);
    } catch (error) {
        const productremoveError = httpErrors(400, 'This user cant remove product!!')
        next(productremoveError);
    }
}

async function readData(req, res, next){
    try {
        const userId = req.user.user_id;
        const readData = await productServices.readData(userId)
        return res.send(readData)
    } catch (error) {
        const productremoveError = httpErrors(400, 'This user cant read data!!')
        next(productremoveError);
    }
}

module.exports = {registerProduct, removeProduct, readData}