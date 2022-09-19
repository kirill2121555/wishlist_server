const userModel = require("../model/userModel");
const { sendActivationMail } = require("../services/mailServise");
const ApiError = require('../exeprion/api-error');
const jwt = require('jsonwebtoken');



class UserService {

    async activate(activateonLink) {
        const user = await userModel.findOne({ activateLink: activateonLink })
        if (!user) {
            throw new ApiError.BadRequest('Necoreknai ssilka aktivacii')
        }
        user.isActivate = true;
        await user.save();
    }

    async getId(req) {
        try {
            const token = req.headers.authorization.split(' ')[1]
            if (!token) {
                return res.status(401).json({ message: "Не авторизован" })
            }
            const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
            console.log(decoded)
            req.user = decoded
            const id = req.user.id
            console.log(id)

            return id
        }
        catch (e) {
            console.log('error = ',e)
        }
    }
}
module.exports = new UserService();