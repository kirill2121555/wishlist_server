const userModel = require("../model/userModel");
const wishModel = require("../model/wishModel");
const userService = require('../services/userServise')


class WishController {

    async addwish(req, res) {
        try {
            const id = await userService.getId(req)
            const { text } = req.body
            const wish = await wishModel.create({ title: text })
            wish.save()
            const user = await userModel.findById(id)
            user.wish.push(wish._id)
            user.save()
            return res.status(200).json(wish)
        } catch (e) {
            console.log(e)
            return res.status(400).json('error')
        }
    }

    async updatewish(req, res) {
        try {
            const { id, text } = req.body
            const wish = await wishModel.updateOne({ _id: id }, { $set: { title: text } })
            wish.save
            return res.status(200).json('wish')
        }
        catch (e) {
            return res.status(400).json('error')
        }
    }

    async deletewish(req, res) {
        try {
            const { id } = req.params
            const iduser = await userService.getId(req)
            const user = await userModel.updateOne({ _id: iduser }, { $pull: { wish: id } })
            user.save()
            await wishModel.deleteOne({ _id: id })
            return res.status(200).json('deleted')
        } catch (e) {
            return res.status(400).json('error')
        }
    }
}

module.exports = new WishController();
