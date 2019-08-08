const StudentsService = {

  getAllStudents(db) {
    return db('sprout_students')
      .select('*');
  },

  addStudent(db, student) {
    return db('sprout_students')
      .insert(student)
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },

  deleteStudent(db, id) {
    return db('sprout_students')
      .where({ id })
      .delete();
  },

  updateStudent(db, id, updateData) {
    return db('sprout_students')
      .where({ id })
      .update(updateData);
  }

  
};

module.exports = StudentsService;