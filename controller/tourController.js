const Tour = require('./../models/tourModel');
const APIFeatures = require(`${__dirname}/../utils/apiFeatures`);
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

/*var getAllTours = catchAsync(async (req, res, next) => {
  var features = new APIFeatures(Tour.find(), req.query);
  var query = features
    .filter()
    .sort()
    .limitFields()
    .paginate();

  /*if (req.query.page) {
      const numberOfDocs = await Tour.countDocuments();
      if (skip >= numberOfDocs) throw new Error('This page does not exist');
    }

  var tours = await query.query;

  res.status(200).send({
    status: 'success',
    results: tours.length,
    data: { tours }
  });
});*/
var getAllTours = factory.getAll(Tour);

/*
var getTour = catchAsync(async (req, res, next) => {
  var tour = await Tour.findById(req.params.id).populate('reviews');

  if (!tour) {
    let error = new AppError('No Tour Found with that ID', 404);
    return next(error);
  }

  res.status(200).send({
    status: 'success',
    data: { tour }
  });
});*/
const getTour = factory.getOne(Tour, { path: 'reviews' });

/*
var createTour = catchAsync(async (req, res, next) => {
  var newTour = await Tour.create(req.body);

  res.status(201).send({
    status: 'success',
    data: { tour: newTour }
  });
});
*/
let createTour = factory.createOne(Tour);

/*
var updateTour = catchAsync(async (req, res, next) => {
  var tour = await Tour.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

  if (!tour) return next(new AppError('No Tour Found with that ID', 404));

  res.status(200).send({
    status: 'success',
    data: { tour }
  });
});*/
let updateTour = factory.updateOne(Tour);

/*var deleteTour = catchAsync(async (req, res, next) => {
  var tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) return next(new AppError('No Tour Found with that ID', 404));

  res.status(204).send({
    status: 'success',
    data: null
  });
});*/
let deleteTour = factory.deleteOne(Tour);

const getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numOfRatings: { $sum: '$ratingsQuantity' },
        averageRating: { $avg: '$ratingsAverage' },
        averagePrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: {
        averagePrice: 1
      }
    }
  ]);

  res.status(200).send({
    status: 'success',
    data: { stats }
  });
});

const getMonthlyPlan = catchAsync(async (req, res, next) => {
  let year = req.params.year;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numOfTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: { _id: 0 }
    },
    {
      $sort: {
        numOfTourStarts: -1
      }
    },
    {
      $limit: 12
    }
  ]);

  res.status(200).send({
    status: 'success',
    data: { plan }
  });
});

const getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, unit, latlng } = req.params;
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) next(new AppError('Please provide in the format lat,lon', 400));

  let radius = unit == 'mi' ? distance / 3963.2 : distance / 6378.1;
  const tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } } });

  res.status(200).send({
    status: 'success',
    results: tours.length,
    data: { tours }
  });
});

const getDistances = catchAsync(async (req, res, next) => {
  const { unit, latlng } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit == 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) next(new AppError('Please provide in the format lat,lon', 400));

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng * 1, lat * 1] },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).send({
    status: 'success',
    data: { data: distances }
  });
});

const aliasTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

module.exports = {
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
};
