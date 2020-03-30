const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const _ = require('lodash');
const factory = require('./handlerFactory');

const filterObjects = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

/*const getAllUsers = catchAsync(async (req, res, next) => {
  var users = await User.find();

  res.status(200).send({
    status: 'success',
    results: users.length,
    data: { users }
  });
});*/
const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

const getAllUsers = factory.getAll(User);

const getUser = factory.getOne(User);

const updateUser = factory.updateOne(User);

const deleteUser = factory.deleteOne(User);

const updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm)
    return next(new AppError('Cannot update your password from here.', 400));

  //const options = _.pick(req.body, ['email', 'name']);

  let updatedUser = await User.findByIdAndUpdate(req.user._id, filterObjects(req.body, 'email', 'name'), {
    new: true,
    runValidators: true
  });

  res.status(200).send({
    status: 'success',
    data: { user: updatedUser }
  });
});

const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).send({
    status: 'success',
    data: null
  });
});

module.exports = { getAllUsers, getUser, updateUser, deleteUser, updateMe, deleteMe, getMe };
