const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    required: [true, 'Please tell us your name']
  },
  email: {
    type: String,
    required: [true, 'Please insert your email'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Email not valid. Please insert a valid one.']
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'guide', 'lead-guide', 'admin'],
      message: 'Given role is not available.'
    },
    default: 'user'
  },
  password: {
    type: String,
    required: true,
    minLength: 4,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Password confirmation is mendatory'],
    validate: {
      validator: function(val) {
        return val === this.password;
      },
      message: 'Password are not matching'
    }
  },
  passwordChangedAt: { type: Date, default: Date.now() },
  passResetToken: String,
  passResetExpires: Date,
  active: {
    default: true,
    type: Boolean,
    select: false
  },
  photo: {
    type: String,
    trim: true
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  else {
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function(password, realPassword) {
  return await bcrypt.compare(password, realPassword);
};

userSchema.methods.changePasswordAfter = function(jwtTimeStamp) {
  if (this.passwordChangedAt) {
    let changedtimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return jwtTimeStamp < changedtimeStamp;
  }
  return false;
};

userSchema.methods.passwordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('Users', userSchema);

module.exports = User;
