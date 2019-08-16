/*eslint eqeqeq: 0*/
const express = require('express');
const path = require('path');
const UsersService = require('./users-service');

const usersRouter = express.Router();
const jsonBodyParser = express.json();

usersRouter
//POST 'API/USERS'
  .route('/')
  .post(jsonBodyParser, (req, res, next) => {
    const { username, password, email } = req.body;

    const requiredKeys = {username, password, email};
    for (const [key, value] of Object.entries(requiredKeys)) {
      if (value == null) {
        return res.status(400).json({ error: `Missing ${key} in request body`});
      }
    }

    const passwordError = UsersService.validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    UsersService.hasUserWithUserName(req.app.get('db'), username)
      .then(hasUserWithUserName => {
        if (hasUserWithUserName) {
          return res.status(400).json({ error: 'Username already exists'});
        }

        return UsersService.hashPassword(password)
          .then(hashedPassword => {
            const newUser = { username, password: hashedPassword, email, date_created: 'now()' };

            return UsersService.addUserToDatabase(req.app.get('db'), newUser)
              .then(user => {
                return res.status(201)
                  .location(path.posix.join(req.originalUrl, `/${user.id}`))
                  .json(UsersService.serializeUser(user));
              });
          });
      })
      .catch(err => next(err));
  });

module.exports = usersRouter;