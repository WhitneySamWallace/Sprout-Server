/*eslint eqeqeq: 1*/
const express = require('express');

const authRouter = express.Router();
const jsonBodyParser = express.json();

authRouter
  .route('/login')
  // POST '/LOGIN'
  .post(jsonBodyParser, (req, res) => {
    const { username, password } = req.body;
    const loginUser = { username, password };
    
    for (const [key, value] of Object.entries(loginUser))
      if (value == null)
        return res.status(400).json({ error: `Missing ${key} in request body`});
  });

// compare with database

module.exports = authRouter;