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


router.get('/data-heart', userController.getDashboardheartData);


router.post('/data-entry-heart', userController.createHeartRateData);


router.post('/data-entry', userController.createData);
router.get('/dashboard-data', userController.getDashboardData);

router.post('/fetchdata', userController.dataFetch);

router.post('/generate-url', userController.generateUrl);

router.post('/get-access-token', userController.getAccessToken);

router.get('/get-extend-token', userController.extendToken);

router.get('/get-activity-data', userController.getIntraDataActivity);

router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUsers);


router
    .route('/:id')
    .get(userController.getSingleUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser)


module.exports = router;
