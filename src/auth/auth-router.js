/*eslint eqeqeq: 0*/
const express = require('express');
const AuthService = require('./auth-service');
const { requireAuth } = require('../middleware/jwt-auth');
const authRouter = express.Router();
const jsonBodyParser = express.json();

authRouter
  .route('/login')
  // POST 'API/AUTH/LOGIN'
  .post(jsonBodyParser, (req, res, next) => {
    const { username, password } = req.body;
    const loginUser = { username, password };
    
    for (const [key, value] of Object.entries(loginUser))
      if (value == null) {
        return res.status(400).json({ error: `Missing ${key} in request body`});
      }

    // compare with database
    AuthService.getUserWithUserName(req.app.get('db'), loginUser.username)
      .then(dbUser => {
        if (!dbUser) {
          return res.status(400).json({ error: 'Incorrect username or password'});
        }
        return AuthService.comparePasswords(loginUser.password, dbUser.password)
          .then(compareMatch => {
            if (!compareMatch) {
              return res.status(400).json({ error: 'Incorrect username or password' });
            }
            const sub = dbUser.username;
            const payload = { user_id: dbUser.id };
            res.send({
              authToken: AuthService.createJwt(sub, payload),
            });
          })
          .catch(err => next(err));
      });
  });

authRouter
//POST 'API/AUTH/USERS'
  .route('/users')
  .post(jsonBodyParser, (req, res, next) => {
    console.log('Getting here, and data is: ', req.body);
    const { username, password, email } = req.body;
    const newUser = { username, password, email, date_created: 'now()' };

    const requiredKeys = {username, password, email};
    for (const [key, value] of Object.entries(requiredKeys)) {
      if (value == null) {
        return res.status(400).json({ error: `Missing ${key} in request body`});
      }
    }

    //Check to see if username already exists <----------------------------------------- TODO!

    return AuthService.addUserToDatabase(req.app.get('db'), newUser)
      .then(user => {
        return res.status(201).json({message: `The user ${user[0].username} has been created.`});
      })
      .catch(err => next(err));
  });

authRouter
  .route('/refresh')
//POST 'API/AUTH/REFRESH'
  .post(requireAuth, (req, res) => {
    const sub = req.user.username;
    const payload = { user_id: req.user.id };

    res.send({
      authToken: AuthService.createJwt(sub, payload)
    });
  });




module.exports = authRouter;