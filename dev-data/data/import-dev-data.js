const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require(`${__dirname}/../../models/tourModel`);
const User = require(`${__dirname}/../../models/userModel`);
const Review = require(`${__dirname}/../../models/reviewModel`);
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log('Connected to the DB on atlas Successfully'));

var importData = async () => {
  let newUser;
  try {
    await Tour.create(tours);
    users.forEach(async user => {
      newUser = new User(user);
      await newUser.save({ validateBeforeSave: false });
    });
    await Review.create(reviews);
    process.exit();
  } catch (e) {
    console.log(e);
  }
};

var deleteData = async () => {
  try {
    await Tour.deleteMany({});
    await User.deleteMany({});
    await Review.deleteMany({});
    process.exit();
  } catch (e) {
    console.log(e);
  }
};

const operation = process.argv[2];
if (operation === '--delete') deleteData();
else if (operation === '--insert') importData();
