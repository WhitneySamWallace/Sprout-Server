const StudentsService = {

  getAllStudents(db, user_id) {
    return db('sprout_students')
      .select('*')
      .where( 'sprout_user_id', user_id);
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