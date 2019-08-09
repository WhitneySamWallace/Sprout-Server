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
    console.log(loginUser);
    
    for (const [key, value] of Object.entries(loginUser))
      if (value == null)
        return res.status(400).json({ error: `Missing ${key} in request body`});

    // compare with database
    AuthService.getUserWithUserName(req.app.get('db'), loginUser.username)
      .then(dbUser => {
        if (!dbUser) {
          return res.status(400).json({ error: 'Incorrect user_name or password'});
        }
        return AuthService.comparePasswords(loginUser.password, dbUser.password)
          .then(compareMatch => {
            if (!compareMatch) {
              return res.status(400).json({ error: 'Incorrect user_name or password' });
            }
            const sub = dbUser.user_name;
            const payload = { user_id: dbUser.id };
            res.send({
              authToken: AuthService.createJwt(sub, payload),
            });
          })
          .catch(err => next(err));
      });

    authRouter
      .route('/refresh')
      //POST 'API/AUTH/REFRESH'
      .post(requireAuth, (req, res) => {
        const sub = req.user.user_name;
        const payload = { user_id: req.user.id };

        res.send({
          authToken: AuthService.createJwt(sub, payload)
        });
      });
  });



module.exports = authRouter;