const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

/*
const getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.id) filter['tour'] = req.params.id;

  let reviews = await Review.find(filter);

  res.status(200).send({
    status: 'success',
    results: reviews.length,
    data: { reviews }
  });
});*/
const getAllReviews = factory.getAll(Review);

const setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.id;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

const createReview = factory.createOne(Review);
const deleteReview = factory.deleteOne(Review);
const updateReview = factory.updateOne(Review);
const getReview = factory.getOne(Review);

module.exports = { getAllReviews, createReview, deleteReview, updateReview, setTourUserIds, getReview };
