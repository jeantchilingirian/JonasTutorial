const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  console.log(err.name);
  console.log(err.message);
  //server.close(() => {
  process.exit(1);
  // });
});

dotenv.config({ path: './config.env' });

var app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log('Connected to the DB on atlas Successfully'));

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Server listening to port ${port}`);
});

process.on('unhandledRejection', err => {
  console.log(err.name);
  console.log(err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED. Server shutting down gracefully.');
  server.close(() => {
    console.log('Process Terminated');
  });
});
