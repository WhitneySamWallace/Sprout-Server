require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const studentsRouter = require('./students/students-router');
const authRouter = require('./auth/auth-router');
const logger = require('./logger');

const app = express();

// set up Morgan
const morganOption = (NODE_ENV === 'production') ? 'common' : 'dev';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get('Authorization');
  console.log(process.env.API_TOKEN);

  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    logger.error(`Unathorized request to path: ${req.path}`);
    return res.status(401).json({ error: 'Unauthorized request' });
  }

  next();
});

app.use('/api/students', studentsRouter);
app.use('/api/auth', authRouter);

//if 4 params, knows error is first; 2 or 3 params, knows req, res (next), need to have next despiten not using it (to equal 4)
app.use(function errorHandler(error, req, res, next) { // eslint-disable-line no-unused-vars
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;