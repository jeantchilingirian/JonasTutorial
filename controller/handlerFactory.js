const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require(`${__dirname}/../utils/apiFeatures`);

exports.deleteOne = Model => {
  return catchAsync(async (req, res, next) => {
    var doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) return next(new AppError('No document found with that ID', 404));

    res.status(204).send({
      status: 'success',
      data: null
    });
  });
};

exports.updateOne = Model => {
  return catchAsync(async (req, res, next) => {
    var doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (!doc) return next(new AppError('No doc Found with that ID', 404));

    res.status(200).send({
      status: 'success',
      data: { data: doc }
    });
  });
};

exports.createOne = Model => {
  return catchAsync(async (req, res, next) => {
    var doc = await Model.create(req.body);

    res.status(201).send({
      status: 'success',
      data: { data: doc }
    });
  });
};

exports.getOne = (Model, popOptions) => {
  return catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);

    let doc = await query;

    if (!doc) {
      let error = new AppError('No doc Found with that ID', 404);
      return next(error);
    }

    res.status(200).send({
      status: 'success',
      data: { data: doc }
    });
  });
};

exports.getAll = Model => {
  return catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.id) filter['tour'] = req.params.id;

    var features = new APIFeatures(Model.find(filter), req.query);
    var query = features
      .filter()
      .sort()
      .limitFields()
      .paginate();

    /*if (req.query.page) {
            const numberOfDocs = await Tour.countDocuments();
            if (skip >= numberOfDocs) throw new Error('This page does not exist');
          }*/

    var doc = await query.query;

    res.status(200).send({
      status: 'success',
      results: doc.length,
      data: { data: doc }
    });
  });
};
