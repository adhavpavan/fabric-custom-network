const express = require('express');
const validate = require('../../middlewares/validate');
const authValidation = require('../../validations/auth.validation');
const authController = require('../../controllers/auth.controller');
const {auth} = require('../../middlewares/auth');

const router = express.Router();

router.post('/register', validate(authValidation.register), authController.register);
router.post('/login/google-auth', validate(authValidation.loginGoogleAuth), authController.loginGoogleAuth);
router.post('/login', validate(authValidation.login), authController.login);
router.post('/logout', validate(authValidation.logout), authController.logout);
router.get('/test',  authController.test);

module.exports = router;