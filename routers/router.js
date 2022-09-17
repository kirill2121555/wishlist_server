const Router = require('express');
const userController = require('../controller/userController');
const router = new Router()
const wishController=require('../controller/wishController')
const friendsController=require('../controller/friendsController')
const authmiddleware =require('./../middlewares/auth-middleware')

router.post('/registration',userController.registration);
router.post('/login', userController.login)

router.get('/logout', userController.logout)
router.get('/activate/:link', userController.activate)
router.get('/auth', authmiddleware,userController.check)

router.get('/profil',authmiddleware,userController.profil)
router.post('/addwish',authmiddleware,wishController.addwish)

router.post('/updatewish', authmiddleware,wishController.updatewish)
router.delete('/deleteonewish/:id',authmiddleware, wishController.deletewish)


router.get('/myfriends', authmiddleware,friendsController.myfriends)
router.get('/friendwish', authmiddleware,friendsController.friendwish)

router.get('/addfriend', authmiddleware,friendsController.addfriend)
router.delete('/deleteonefriend/:id', authmiddleware,friendsController.deletefriend)


router.get('/o',friendsController.o)




module.exports = router