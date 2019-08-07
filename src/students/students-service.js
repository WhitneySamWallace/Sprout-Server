const StudentsService = {

  getAllStudents(db) {
    return db('sprout_students')
      .select('*');
  }
  
};

module.exports = StudentsService;