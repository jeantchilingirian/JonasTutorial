const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const util = require('util');
const sendEmail = require('./../utils/email');
const crypto = require('crypto');

const signUp = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, role } = req.body;
  const newUser = await User.create({ name, email, password, passwordConfirm, role });

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 60 * 60 * 1000),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  newUser.password = undefined;
  res.status(201).send({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
});

const logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) return next(new AppError('Please provide email and password', 400));

  let user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 60 * 60 * 1000),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  res.status(200).send({
    status: 'success',
    token
  });
});

const protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) return next(new AppError('Please Log In to have access.', 401));

  let decoded = await util.promisify(jwt.verify)(token, process.env.JWT_SECRET);

  let freshUser = await User.findById(decoded.id);
  if (!freshUser) return next(new AppError('User no longer exist', 401));

  if (freshUser.changePasswordAfter(decoded.iat))
    return next(new AppError('User recently changed password. Please log in again'), 401);

  req.user = freshUser;
  res.locals.user = freshUser;
  next();
});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(new AppError('You do not have permission to perform this action', 403));

    next();
  };
};

const forgotPassword = catchAsync(async (req, res, next) => {
  console.log(req.body);
  let user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError(`User doesn't exist. Please enter a valid email address`), 404);

  const resetToken = user.passwordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${resetToken}`;
  const message = `Forgot your password? Sumbit a request with your new password to ${resetURL}.\nPlease ignore this email if you haven't forgotten your password.`;
  console.log(message);

  try {
    let x = await sendEmail({
      email: user.email,
      subject: `Your password reset token is valid for 10 minutes`,
      message
    });

    res.status(200).send({
      status: 'success',
      message: 'Token sent to email'
    });
  } catch (e) {
    user.passResetToken = undefined;
    user.passResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Error when sending the reset password email. Try again later.'), 500);
  }
});

const resetPassword = catchAsync(async (req, res, next) => {
  const hash = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({ passResetToken: hash, passResetExpires: { $gt: Date.now() } });
  if (!user) return next(new AppError(`token invalid or expired`, 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passResetToken = undefined;
  user.passResetExpires = undefined;
  await user.save();

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

  res.status(200).send({
    status: 'success',
    token
  });
});

const updatePassword = catchAsync(async (req, res, next) => {
  let user = await User.findById(req.user._id).select('+password');

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password)))
    return next(new AppError('Your Current Password is wrong', 401));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

  res.status(200).send({
    status: 'success',
    token
  });
});

const isLoggedIn = async (req, res, next) => {
  let token;
  if (req.cookies.jwt) {
    try {
      let decoded = await util.promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

      let freshUser = await User.findById(decoded.id);
      if (!freshUser) return next();

      if (freshUser.changePasswordAfter(decoded.iat)) return next();

      res.locals.user = freshUser;
      return next();
    } catch (e) {
      return next();
    }
  }
  next();
};

const logout = catchAsync(async (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).send({
    status: 'success'
  });
});

module.exports = {
  signUp,
  logIn,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
  isLoggedIn,
  logout
};
