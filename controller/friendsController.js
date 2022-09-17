const userModel = require("../model/userModel");
const wishModel = require("../model/wishModel");

const userServise = require("../services/userServise");
const qr = require('qrcode')


class UserController {

    async myfriends(req, res) {
        try {
            const id = await userServise.getId(req)
            const user = await userModel.findById(id, { friends: 1 }).lean()
            const friend = []
            let person
            for (let i = 0; i < user.friends.length; i++) {
                person = await userModel.findById(user.friends[i], { nick: 1, birthday: 1 }).lean()
                friend.push(person)
            }
            console.log(friend)
            return res.status(200).json(friend)
        } catch (e) {
            return res.status(400).json('error')

        }
    }

    async friendwish(req, res) {
        try {
            const { id } = req.query
            const user = await userModel.findById({ _id: id }, { wish: 1 }).lean()
            const friendwish = []
            let wish
            for (let i = 0; i < user.wish.length; i++) {
                wish = await wishModel.findById(user.wish[i], { title: 1 }).lean()
                friendwish.push(wish)
            }
            return res.status(200).json(friendwish)
        } catch (e) {
            return res.status(400).json('error')

        }
    }
    async addfriend(req, res) {
        try {
            const userid = await userServise.getId(req)
            const { email } = req.query
            const friend = await userModel.findOne({ email })
            if (!friend) {
                return res.status(400).json('usera net')
            }
            const user = await userModel.findById(userid)
            if (user.friends.includes(friend._id)) {
                return res.status(200).json('usera in your friends')
            }
            await user.friends.push(friend._id)
            await user.save()
            return res.status(200).json('okkk')
        } catch (e) {
            return res.status(400).json('error')
        }
    }

    async deletefriend(req, res) {
        try {
            const { id } = req.params
            const iduser = await userServise.getId(req)
            const user = await userModel.updateOne({ _id: iduser }, { $pull: { friends: id } })
            return res.status(200).json('deleted')
        } catch (e) {
            console.log('erroee = ', e)
            return res.status(400).json('error')

        }
    }

    async qrcode(req, res) {
        try {
            const id = await userServise.getId(req)
            const user = await userModel.findById(id)
            const link = process.env.URL_FRONT + user.email
            console.log(link)
            return await qr.toDataURL(link)
        } catch (err) {
            return res.status(400).json('error')
        }
    }
    async o(req,res){
        return res.status(200).json('hi')

    }
}

module.exports = new UserController();
