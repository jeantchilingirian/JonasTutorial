const express = require('express');
const {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances
} = require(`./../controller/tourController`);
const authController = require('./../controller/authController');
const reviewRouter = require('./../routes/reviewRoutes');

const tourRouter = express.Router();

tourRouter.use('/:id/reviews', reviewRouter);
/*tourRouter.param('id', (req, res, next, val) => {
  console.log(`Tour ID is: ${val}`);
  var id = req.params.id * 1;
  var tour = tours.filter(el => el.id === id)[0];

  if (!tour) {
    return res.status(404).send({
      status: 'fail',
      message: 'Tour not found'
    });
  }
  next();
});*/

tourRouter.route('/tour-within/:distance/center/:latlng/unit/:unit').get(getToursWithin);
tourRouter.route('/distances/:latlng/unit/:unit').get(getDistances);

tourRouter
  .route('/')
  .get(getAllTours)
  .post(authController.protect, authController.restrictTo('admin', 'lead-guide'), createTour);

tourRouter.route('/top-5-cheap').get(aliasTopTours, getAllTours);

tourRouter.route('/tour-stats').get(getTourStats);
tourRouter
  .route('/monthly-plan/:year')
  .get(authController.protect, authController.restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);

tourRouter
  .route('/:id')
  .get(getTour)
  .patch(authController.protect, authController.restrictTo('admin', 'lead-guide'), updateTour)
  .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), deleteTour);

/*tourRouter
  .route('/:id/reviews')
  .post(authController.protect, authController.restrictTo('user'), reviewController.createReview);*/

module.exports = tourRouter;
