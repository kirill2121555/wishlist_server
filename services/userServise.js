const userModel = require("../model/userModel");
const bcrypt = require('bcrypt')
const uuid = require('uuid');
const { sendActivationMail } = require("../services/mailServise");
const tokenService = require('../services/token-service')
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exeprion/api-error');
const jwt = require('jsonwebtoken');



class UserService {

    async registration(email, password) {
        const candidate = await userModel.findOne({ email })
        if (candidate) {
            throw new ApiError.BadRequest('User whis this email registreteg on this site before')
        }
        const hashPassword = await bcrypt.hash(password, 3);
        const activateLink = uuid.v4()
        const user = await userModel.create({ email, password: hashPassword, activateLink })
      //  await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activateLink}`)

        const userDto = new UserDto(user)
        const tokens = tokenService.generateToken({ ...UserDto })
        await tokenService.SaveToken(userDto.id, tokens.refreshToken)

        return { ...tokens, user: userDto }
    }

    async activate(activateonLink) {
        const user = await userModel.findOne({ activateLink: activateonLink })
        if (!user) {
            throw new ApiError.BadRequest('Necoreknai ssilka aktivacii')
        }
        user.isActivate = true;
        await user.save();
    }

    

    async login(email, password) {
        const user = await userModel.findOne({ email: email })
        if (!user) {
            throw ApiError.BadRequest('Пользователь с таким email не найден')
        }
        const isPassEquals = await bcrypt.compare(password, user.password)
        if (!isPassEquals) {
            throw ApiError.BadRequest('Неправильный пароль')
        }
        const userDto = new UserDto(user);
        const tokens = tokenService.generateToken({ ...userDto });

        await tokenService.SaveToken(userDto.id, tokens.refreshToken);
        return { ...tokens, user: userDto }
    }

    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnavthorizedError();
        }
        const userData = await tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken);
        if (!userData || !tokenFromDb) {
            throw ApiError.UnavthorizedError();
        }
        const user = await userModel.findById(userData.id)
        const userDto = new UserDto(user);
        const tokens = tokenService.generateToken({ ...userDto });

        await tokenService.SaveToken(userDto.id, tokens.refreshToken);
        return { ...tokens, user: userDto }
    }

  

    async getId(req) {
        try {
            const token = req.headers.authorization.split(' ')[1] 
            if (!token) {
                return res.status(401).json({message: "Не авторизован"})
            }
            const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
            req.user = decoded
            const id = req.user.id
            return id
        }
        catch (e) {
            console.log('error')
        }
    }
}
module.exports = new UserService();