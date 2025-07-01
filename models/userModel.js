const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tell us ur name'],
  },
  coName: {
    type: String,
    required: [true, 'Provide the company name!'],
  },
  nationalID: {
    type: Number,
    required: [true, 'Provide a valid national ID'],
    length: [14, 'NationalID must be 14 number'],
  },
  email: {
    type: String,
    required: [true, 'Provide a valid email address'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  phone: {
    type: String,
    length: [13, 'The phone number must be 13 character'],
  },
  password: {
    type: String,
    required: [true, 'Provide a password'],
    minLength: [8, 'A Password must be 8 characters or more'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Confirm ur password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords not the same!',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  },
  destination: {
    type: String,
  },
  status: {
    type: String,
    enum: ['awake', 'drowsy', 'sleeping'],
    default: 'awake',
  },
  estimatedArrival: Date,
  rate: {
    type: Number,
    default: 0,
  },
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.pre('save', async function (next) {
  // That will run when the password modified
  if (!this.isModified('password')) return next();
  // The encryption of the password with cost 12
  this.password = await bcrypt.hash(this.password, 12);
  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );

    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
