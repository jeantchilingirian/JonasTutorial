const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModel');

var toursScehma = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name field is required'],
      unique: true,
      trim: true,
      maxlength: [40, 'A Tour name must have less or equal to 40 characters'],
      minlength: [10, 'A tour must have more than 10 characters']
      /*,validate: [validator.isAlpha, 'Tour name must only contain characters']*/
    },
    price: {
      type: Number,
      required: [true, 'Price field is required']
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      //enum: ['easy', 'medium', 'difficult']
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficuly can be either set to easy, medium or difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be lower than the original price'
      }
    },
    summary: {
      type: String,
      trim: true
    },
    description: {
      type: String
    },
    imageCover: {
      type: String,
      required: [true, 'A Tour must have a cover image.']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    slug: String,
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        // Array  -> THis was for embedding
        type: mongoose.Schema.ObjectId,
        ref: 'Users'
      }
    ]
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

//toursScehma.index({price: 1});
toursScehma.index({ price: 1, ratingsAverage: -1 });
toursScehma.index({ slug: 1 });
toursScehma.index({ startLocation: '2dsphere' });

toursScehma.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

toursScehma.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

toursScehma.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//FOR EMBEDDING USERS IN TOURS
/*
toursScehma.pre('save', async function(next) {
  const guidesPromise = this.guides.map(async el => await User.findById(el));
  this.guides = await Promise.all(guidesPromise);
  next();
});*/

/*toursScehma.post('save', function(doc, next) {
  console.log(doc);
  next();
});*/

toursScehma.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
  next();
});

toursScehma.pre(/^find/, function(next) {
  this.find({ $or: [{ secretTour: { $ne: true } }, { secretTour: false }] });
  this.start = Date.now();
  next();
});

toursScehma.post(/^find/, function(docs, next) {
  console.log(`the Query took ${Date.now() - this.start}ms`);
  next();
});

/*
toursScehma.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});*/

var Tour = mongoose.model('Tour', toursScehma);

module.exports = Tour;
