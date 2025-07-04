const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

///////////////////////////////////
// Route Users
///////////////////////////////////
const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword,
);

router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    userController.getAllUsers,
  )
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    userController.createUser,
  );
// router
//   .route('/:id')
//   .get(
//     authController.protect,
//     authController.restrictTo('admin'),
//     userController.getUser,
//   )
//   .patch(
//     authController.protect,
//     authController.restrictTo('admin'),
//     userController.updateUser,
//   )
//   .delete(
//     authController.protect,
//     authController.restrictTo('admin'),
//     userController.deleteUser,
//   );
router.get(
  '/drivers',
  authController.protect,
  authController.restrictTo('admin'),
  userController.getAllDrivers,
);

router.patch(
  '/updateStatus',
  authController.protect,
  userController.updateStatus,
);

module.exports = router;
