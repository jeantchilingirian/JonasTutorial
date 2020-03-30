const express = require('express');
const {
  getUser,
  getAllUsers,
  deleteUser,
  updateUser,
  getMe,
  updateMe,
  deleteMe
} = require(`./../controller/userController`);
const authController = require('./../controller/authController');

const userRouter = express.Router();

//userRouter.route('/signup').post(authController.signUp);
userRouter.post('/signUp', authController.signUp);
userRouter.post('/login', authController.logIn);
userRouter.get('/logout', authController.logout);
userRouter.post('/forgotpassword', authController.forgotPassword);
userRouter.patch('/resetpassword/:token', authController.resetPassword);

userRouter.use(authController.protect);

userRouter.patch('/updatemypassword', authController.updatePassword);
userRouter.patch('/updateme', updateMe);
userRouter.delete('/deleteme', deleteMe);

//.post(createUser);
userRouter.route('/me').get(getMe, getUser);

userRouter.use(authController.restrictTo('admin'));

userRouter.route('/').get(getAllUsers);

userRouter
  .route('/:id')
  .get(getUser)
  .delete(deleteUser)
  .patch(updateUser);

module.exports = userRouter;
