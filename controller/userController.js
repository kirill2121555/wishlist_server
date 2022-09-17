
const userService = require('../services/userServise')
const bcrypt = require('bcrypt')
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const mailService = require('../services/mailServise');
const userModel = require('../model/userModel')
const ApiError = require('../exeprion/api-error');
const wishModel = require('../model/wishModel');
const qr = require('qrcode')

const generateJwt = (id, email) => {
  const a = jwt.sign(
    { id, email },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '24h' }
  )
  return a
}

class UserController {
  async registration(req, res, next) {
    try {

      const { email, password, nick } = req.body
      if (!email || !password) {
        return next(ApiError.badRequest('Некорректный email или password'))
      }
      console.log('w')

      const candidate = await userModel.findOne({ email: email })
      if (candidate) {
        return next(ApiError.badRequest('Пользователь с таким email уже существует'))
      }

      const hashPassword = await bcrypt.hash(password, 5)
      const activateLink = uuid.v4()

      const user = await userModel.create({ email, password: hashPassword, activateLink: activateLink, nick: nick })
      console.log(user.id)

      const token = generateJwt(user.id, user.email)
      console.log('sad')

      // await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activateLink}`)
      return res.status(200).json({ token })
    } catch (e) {
      return res.status(400).json('error')
    }
  }

  async login(req, res, next) {
    try {
      console.log('asdsa')
      const { email, password } = req.body
      console.log(email, password)
      const user = await userModel.findOne({ email: email })
      if (!user) {
        return next(ApiError.internal('Пользователь не найден'))
      }
      if (!user.isActivate) {
        return next(ApiError.internal('Акаунт не активирован! Перейдите на почту и активируйте аккаунт'))
      }
      let comparePassword = bcrypt.compareSync(password, user.password)
      if (!comparePassword) {
        return next(ApiError.internal('Указан неверный пароль'))
      }
      console.log('sssss')

      const token = generateJwt(user.id, user.email)
      console.log('token', token)

      return res.json({ token })
    } catch (error) {
      logger.error('Error in login function');
      return res.status(400).json('error')
    }
  }

  async check(req, res) {
    try {
      // console.log('req.user.id, req.user.email')

      // console.log(req.user.id, req.user.email)

      const token = generateJwt(req.user.id, req.user.email, req.user.role, req.user.nick)
      return res.json({ token })
    } catch (error) {
      return res.status(400).json('error')
    }
  }




  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const token = await userService.logout(refreshToken);
      res.clearCookie('refreshToken');
      return res.json(token);
    } catch (e) {
      logger.error('Error in logout function');
      return res.status(400).json('error')
    }
  }

  async activate(req, res, next) {
    try {
      const activationLink = req.params.link
      await userService.activate(activationLink)
      return res.redirect(process.env.Cl_URL)
    } catch (e) {
      return res.status(400).json('error')
    }
  }
  async profil(req, res) {
    try {
      const id = await userService.getId(req)

      const user = await userModel.findById(id, { nick: 1, wish: 1,email:1 }).lean()
      if (!user) {
        return res.status(400).json('user not found')
      }
      const arrwish = []
      for (let i = 0; i < user.wish.length; i++) {
        let wish = await wishModel.findById(user.wish[i])
        arrwish.push(wish)
      }
      
      const link = process.env.URL_FRONT +'addfriend?email='+ user.email
      const qrr = await qr.toDataURL(link)
  
      return res.status(200).json([user, qrr, arrwish])
    } catch (e) {
      return res.status(400).json('error')
    }
  }


  async myfriend(req, res) {
    try {
      const id = userServise.getId(req)
      const friends = await userModel.findById({ id }, { friends }).lean()
      console.log('user========', friends)
      if (!friends) {
        return res.status(400).json('friends not found')
      }
      const arrfriends = []
      for (let i = 0; i < friends.length; i++) {
        let friend = await userModel.findById({ _id: friends[i] }, { nick }).lean()
        arrfriends.push(friend)
      }
      console.log('friendsArr====', arrfriends)
      return res.status(200).json(arrfriends)
    } catch (e) {
      return res.status(400).json('error')
    }
  }


}

module.exports = new UserController();
