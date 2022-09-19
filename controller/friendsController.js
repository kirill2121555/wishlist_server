const userModel = require("../model/userModel");
const wishModel = require("../model/wishModel");
const userServise = require("../services/userServise");


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
            const datanow = new Date()
            const now = (datanow.getMonth() * 30.417) + datanow.getDate()
            const aa = friend.sort((a, b) => a.birthday - b.birthday)
            let posishen
            for (let i = 0; i < aa.length; i++) {
                if (((aa[i].birthday.getMonth() * 30.417) + aa[i].birthday.getDate()) > now) {
                    posishen = i;
                    break;
                }
            }
            const notsoon = aa.slice(0, posishen)
            const soon = aa.slice(posishen)
            const friends = [...soon, ...notsoon];
            return res.status(200).json(friends)
        } catch (e) {
            console.log('error ', e)
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
            const friend = await userModel.findOne({ email }, { _id: 1 }).lean()
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
            await userModel.updateOne({ _id: iduser }, { $pull: { friends: id } })
            return res.status(200).json('deleted')
        } catch (e) {
            console.log('erroee = ', e)
            return res.status(400).json('error')

        }
    }

}

module.exports = new UserController();
