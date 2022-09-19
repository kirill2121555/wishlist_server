
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
      const { email, password, nick ,date} = req.body
      if (!email || !password) {
        return next(ApiError.badRequest('Некорректный email или password'))
      }
      const candidate = await userModel.findOne({ email: email },{email:1}).lean()
      if (candidate) {
        return next(ApiError.badRequest('Пользователь с таким email уже существует'))
      }
      const hashPassword = await bcrypt.hash(password, 5)
      const activateLink = uuid.v4()
      const user = await userModel.create({ email, password: hashPassword, activateLink: activateLink, nick: nick,birthday: date })
      
      const token = generateJwt(user.id, user.email)

      await mailService.sendActivationMail(email, `${process.env.API_URL}/activate/${activateLink}`)
      return res.status(200).json({ token })
    } catch (e) {
      return res.status(400).json('error')
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body
      const user = await userModel.findOne({ email: email }).lean()
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
      
      const token = generateJwt(user._id, user.email)
      return res.json({ token })
    } catch (error) {
      return res.status(400).json('error')
    }
  }

  async check(req, res) {
    try {
      const token = generateJwt(req.user.id, req.user.email, req.user.role, req.user.nick)
      return res.json({ token })
    } catch (error) {
      return res.status(400).json('error')
    }
  }

  async logout(req, res) {
    try {
      const { refreshToken } = req.cookies;
      res.clearCookie('refreshToken');
      return res.json(token);
    } catch (e) {
      logger.error('Error in logout function');
      return res.status(400).json('error')
    }
  }

  async activate(req, res) {
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
      console.log('req',req.headers.authorization)

      const id = await userService.getId(req)
      console.log('id=== ',id)

      const user = await userModel.findById(id)
      console.log(user)
      if (!user) {
        return res.status(400).json('user not found')
      }
      const arrwish = []
      for (let i = 0; i < user.wish.length; i++) {
        let wish = await wishModel.findById(user.wish[i]).lean()
        arrwish.push(wish)
      }
      const link = process.env.URL_FRONT +'addfriend/'+ user.email
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
      if (!friends) {
        return res.status(400).json('friends not found')
      }
      const arrfriends = []
      for (let i = 0; i < friends.length; i++) {
        let friend = await userModel.findById({ _id: friends[i] }, { nick }).lean()
        arrfriends.push(friend)
      }
      return res.status(200).json(arrfriends)
    } catch (e) {
      return res.status(400).json('error')
    }
  }
}

module.exports = new UserController();
