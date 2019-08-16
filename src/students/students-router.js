/*eslint eqeqeq: 1*/
const express = require('express');
const  {requireAuth} = require('../middleware/jwt-auth');
const logger = require('../logger');
const StudentsService = require('./students-service');

const studentRouter = express.Router();
const jsonBodyParser = express.json();

studentRouter
  .route('/')
  .all(requireAuth)
  // GET '/'
  .get((req, res, next) => {
    const user_id = req.user.id;
    StudentsService.getAllStudents(req.app.get('db'), user_id)
      .then(students => {
        res.status(200).json(students);
      })
      .catch(err => next(err));
  })
  // POST '/'
  .post(jsonBodyParser, (req, res, next) => {
    const { name } = req.body;
    const user_id = req.user.id; 
    
    if (!name) {
      logger.error('Name is required');
      return res.status(400).send('Invalid data');
    }

    const student = { 
      name: name,
      goal: '',
      priority: '',
      sprout_user_id: user_id,
    };

    StudentsService.addStudent(req.app.get('db'), student)
      .then(student => {
        logger.info(`Student with id: ${student.id} created.`);
        res.status(201)
          .json(student);
      })
      .catch(err => next(err));
  });

studentRouter
  .route('/:studentId')
  .all(requireAuth)
  // DELETE '/'
  .delete((req, res, next) => {
    //delete student
    const { studentId } = req.params;

    StudentsService.deleteStudent(req.app.get('db'), studentId)
      .then(() => {
        logger.info(`Student with id: ${studentId} was deleted.`);
        res.status(204).end();
      })
      .catch(err => next(err));
  })
  // PATCH '/ID'
  .patch(jsonBodyParser, (req, res, next) => {
    //update student
    const { studentId } = req.params;
    const { goal, priority } = req.body;

    if (!studentId || !goal || !priority) {
      logger.error('studentId, goal, and priority are required');
      return res.status(400).send('Invalid data');
    }

    //updated student
    const updatedStudent = {
      id: studentId,
      goal,
      priority,
    };

    StudentsService.updateStudent(req.app.get('db'), studentId, updatedStudent)
      .then(() => {
        logger.info(`Student with id: ${studentId} was updated.`);
        res.status(204).end();
      })
      .catch(err => next(err));
  });

module.exports = studentRouter;