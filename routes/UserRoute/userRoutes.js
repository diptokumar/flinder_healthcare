const express = require('express');
const userController = require('./../../controllers/UserController/userController');
const authController = require('../../controllers/authController');
const router = express.Router();
const { uploadS3 } = require('../../middleware/multer');



router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);


router.use(authController.protect );

router
    .route('/')
    .get(authController.restrictTo('BUYER', 'ADMIN','SELLER'), userController.getAllUsers)
    .post(authController.restrictTo('BUYER', 'ADMIN','SELLER'), userController.createUsers);


router
    .route('/:id')
    .get(authController.restrictTo('BUYER', 'ADMIN','SELLER'), userController.getSingleUser)
    .patch(authController.restrictTo('BUYER', 'ADMIN','SELLER'), userController.updateUser)
    .delete(authController.restrictTo('BUYER', 'ADMIN','SELLER'), userController.deleteUser)


module.exports = router;
