const express = require('express');
const logger = require('../logger');

const studentRouter = express.Router();
const jsonBodyParser = express.json();

// dummy data
const students = [{
  id: 0,
  name: 'Annie',
  goal: 'Write an opening paragraph',
  priority: 'low',
},{
  id: 1,
  name: 'Dwight',
  goal: 'Write an opening paragraph',
  priority: 'low',
}
];

studentRouter
  .route('/')
  // GET '/'
  .get((req, res) => {
    res.json(students);
  })
  // POST '/'
  .post(jsonBodyParser, (req, res) => {
    const { name } = req.body; // needs jsonBodyParser or returns undefined

    if (!name) {
      logger.error('Name is required');
      return res.status(400).send('Invalid data');
    }

    const student = { //just name for right now
      name
    };

    students.push(student);

    logger.info('Student created');
    res.status(201).json(student);
  });

studentRouter
  .route('/:studentId')
  // DELETE '/ID'
  .delete((req, res) => {
    //delete student
    const { studentId } = req.params;

    const studentIndex = students.findIndex(student => student.id == studentId);

    // if no ID is found, findIndex will return -1
    if (studentIndex === -1) {
      logger.error(`Student with id: ${studentId} is not found.`);
      return res.status(404).send('Not Found');
    }

    students.splice(studentIndex, 1);

    logger.info(`Student with id: ${studentId} was deleted.`);

    return res.status(204).end();
  })
  // PATCH '/ID'
  .patch(jsonBodyParser, (req, res) => {
    //update student
    const { studentId } = req.params;
    const { goal, priority } = req.body;

    //find student and set update values
    const student = students.find(student => student.id == studentId);

    //if goal is not a string or is an empty string, keep current goal value
    const goalContent = (typeof(goal) !== 'string' || goal === '' ? student.goal : goal);
    
    //if priority is not a string or is an empty string, keep current priority value
    const priorityContent = (typeof(priority) !== 'string' || priority === '' ? student.priority : priority); 

    //updated student
    const updatedStudent = {
      id: student.id,
      name: student.name,
      goal: goalContent,
      priority: priorityContent,
    };

    //update data
    const updatedStudentIndex = students.findIndex(student => student.id == studentId);
    students[updatedStudentIndex].goal = updatedStudent.goal;
    students[updatedStudentIndex].priority = updatedStudent.priority;
    
    return res.status(201).json(updatedStudent); 
  });


module.exports = studentRouter;