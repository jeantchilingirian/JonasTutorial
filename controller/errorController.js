const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
  let message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/);
  let message = `Duplicate field value: ${value[0]}. Please use another value.`;
  return new AppError(message, 400);
};

const handleValidationError = err => {
  let errors = err.errors;
  let errorMessages = Object.values(errors).map(el => el.message);
  let message = `Invalid input data. ${errorMessages.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = err => {
  return new AppError(`Invalid Token. Please try to Log In again`, 401);
};

const handleJWTExpiredError = err => {
  return new AppError(`Token Expired! Please Login again`, 401);
};

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).send({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack
    });
  } else {
    res.status(err.statusCode).render('error', {
      title: 'Somethign went wrong!',
      msg: err.message
    });
  }
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).send({
        status: err.status,
        message: err.message
      });
    }
    console.log(`ERROR !!!!!!!`);

    return res.status(500).send({
      status: 'error',
      message: 'Something went wrong!!'
    });
  }
  if (err.isOperational) {
    res.status(err.statusCode).render('error', {
      status: err.status,
      msg: err.message
    });
  } else {
    console.log(`ERROR !!!!!!!`);

    res.status(500).render('error', {
      status: 'error',
      msg: 'Please try again later.'
    });
  }
};

const errorHandler = (err, req, res, next) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    //let error = { ...err };
    if (err.name === 'CastError') err = handleCastErrorDB(err);
    if (err.code === 11000) err = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') err = handleValidationError(err);
    if (err.name === 'JsonWebTokenError') err = handleJWTError(err);
    if (err.name === 'TokenExpiredError') err = handleJWTExpiredError(err);
    sendErrorProd(err, req, res);
  }
};

module.exports = errorHandler;
