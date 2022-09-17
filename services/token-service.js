const jwt = require('jsonwebtoken')
const tokenModel = require('../model/tokenModel')


class TokenService {
    generateToken(payload) {
        const accesToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' })
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '10d' })
        return {
            accesToken,
            refreshToken
        }
    }

    async validateAccessToken(token) {
        try {
            const userData = await jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            return userData;
        } catch (e) {
            return null;
        }
    }

    async validateRefreshToken(token) {
        try {
            const userData = await jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            return userData;
        } catch (e) {
            console.log(e)
            return null;
        }
    }

    async SaveToken(userId, refreshToken) {
        const tokenData = await tokenModel.findOne({ user: userId })
        if (tokenData) {
            tokenData.refreshToken = refreshToken
            return tokenData.save()
        }
        const token = await tokenModel.create({ user: userId, refreshToken })
        return token;
    }

    async removeToken(refreshToken) {
        const tokenData = await tokenModel.deleteOne({ refreshToken })
        return tokenData
    }

    async findToken(refreshToken) {
        const tokenData = await tokenModel.findOne({ refreshToken: refreshToken })
        return tokenData
    }
}
module.exports = new TokenService();