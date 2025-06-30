const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    result: users.length,
    users,
  });
});

exports.getAllDrivers = catchAsync(async (req, res, next) => {
  const drivers = await User.find({ role: 'user' });
  res.status(200).json({
    status: 'success',
    data: drivers,
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route not for passsword updates.. plz use /updateMyPassword',
        400,
      ),
    );
  }
  const filteredBody = filterObj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.updateStatus = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      location: req.body.location,
      destination: req.body.destination,
      status: req.body.status,
      estimatedArrival: req.body.estimatedArrival,
    },
    { new: true, runValidators: true },
  );

  const io = req.app.get('io');
  if (io) {
    io.emit('dashboardUpdate', updatedUser);
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Error in internal server',
  });
};

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Error in internal server',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Error in internal server',
  });
};

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Error in internal server',
  });
};
