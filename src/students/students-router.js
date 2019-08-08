/*eslint eqeqeq: 1*/
const express = require('express');
const logger = require('../logger');
const StudentsService = require('./students-service');

const studentRouter = express.Router();
const jsonBodyParser = express.json();

studentRouter
  .route('/')
  // GET '/'
  .get((req, res, next) => {
    StudentsService.getAllStudents(req.app.get('db'))
      .then(students => {
        res.json(students);
      })
      .catch(err => next(err));
  })
  // POST '/'
  .post(jsonBodyParser, (req, res, next) => {
    const { name } = req.body; 
    
    if (!name) {
      logger.error('Name is required');
      return res.status(400).send('Invalid data');
    }

    const student = { 
      name,
      goal: '',
      priority: '',
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
  // DELETE '/ID'
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

    //updated student
    const updatedStudent = {
      id: studentId,
      goal,
      priority,
    };
    console.log(updatedStudent);

    StudentsService.updateStudent(req.app.get('db'), studentId, updatedStudent)
      .then(student => {
        logger.info(`Student with id: ${studentId} was updated.`);
        res.status(200).json(student);
      })
      .catch(err => next(err));
  });

module.exports = studentRouter;