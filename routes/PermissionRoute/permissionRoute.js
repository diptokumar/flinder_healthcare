const express = require('express');
const permissionController = require('./../../controllers/Permission/permission');
const authController = require('../../controllers/authController');
const router = express.Router();
const { uploadS3 } = require('../../middleware/multer');


router.use(authController.protect);

router
    .route('/')
    .get(permissionController.getPermission)
    .post(permissionController.createPermission);


router
    .route('/:id')
    // .get(userController.getSingleUser)
    .patch(permissionController.updatePermission)
    .delete(permissionController.deletePermission)


module.exports = router;
