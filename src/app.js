require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const studentsRouter = require('./students/students-router');
const authRouter = require('./auth/auth-router');
const usersRouter = require('./users/users-router');

const app = express();

// set up Morgan
const morganOption = (NODE_ENV === 'production') ? 'common' : 'dev';

app.use(morgan(morganOption));
app.use(cors());
app.use(helmet());

app.use('/api/students', studentsRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);

app.use(function errorHandler(error, req, res, next) { // eslint-disable-line no-unused-vars
  let response;
  if (NODE_ENV === 'production') {
    response = { error:  'server error' };
  } else {
    console.error(error);
    response = { error: error.message, object: error };
  }
  res.status(500).json(response);
});

module.exports = app;