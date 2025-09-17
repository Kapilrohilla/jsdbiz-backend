const router = require('express').Router();
const AuthController = require('../../controllers/AuthController');
const auth = require('../../utils/auth');


router.post('/signUp', AuthController.signUp);
router.post('/login', AuthController.login);
router.post('/logout', auth.isAuthunticated, AuthController.logOut);
router.put('/update',auth.isAuthunticated, AuthController.updateUser);

module.exports = router;
