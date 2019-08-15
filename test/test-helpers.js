/*eslint no-useless-escape: 0*/
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeUsersArray() {
  return [
    {
      id: 1,
      username: 'Teacher1',
      email: 'teacher1@email.com',
      password: '$2y$12$AaU9tif3xtxLSB.SKcuJL.xsFYPkFTPFRO7cSJURN3v2x7mME.qBu',
      date_created: '2019-08-15T23:37:08.422Z'
    },
    {
      id: 2,
      username: 'Teacher2',
      email: 'teacher2@email.com',
      password: '$2y$12$AaU9tif3xtxLSB.SKcuJL.xsFYPkFTPFRO7cSJURN3v2x7mME.qBu',
      date_created: '2019-08-15T23:37:08.422Z'
    },
    {
      id: 3,
      username: 'Teacher3',
      email: 'teacher3@email.com',
      password: '$2y$12$AaU9tif3xtxLSB.SKcuJL.xsFYPkFTPFRO7cSJURN3v2x7mME.qBu',
      date_created: '2019-08-15T23:37:08.422Z'
    }
  ];
}

function makeStudentsArray(users) {
  return [
    {
      id: 1,
      name: 'Student1',
      goal: 'Goal',
      priority: 'low',
      sprout_user_id: users[0].id
    },
    {
      id: 2,
      name: 'Student2',
      goal: 'Goal',
      priority: 'low',
      sprout_user_id: users[0].id
    },
    {
      id: 3,
      name: 'Student3',
      goal: 'Goal',
      priority: 'low',
      sprout_user_id: users[0].id
    },
    {
      id: 4,
      name: 'Student4',
      goal: 'Goal',
      priority: 'low',
      sprout_user_id: users[1].id
    }
  ];
}

function makeAll() {
  const testUsers = makeUsersArray();
  const testStudents = makeStudentsArray(testUsers);

  return { testUsers, testStudents };
}

function cleanTables(db) {
  return db.transaction(trx => {
    return trx
      .raw(
        `TRUNCATE
      sprout_students,
      sprout_users`
      )
      .then(() => {
        return Promise.all([
          trx.raw(
            'ALTER SEQUENCE sprout_students_id_seq minvalue 0 START WITH 1'
          ),
          trx.raw('ALTER SEQUENCE sprout_users_id_seq minvalue 0 START WITH 1'),
          trx.raw('SELECT setval(\'sprout_students_id_seq\', 0)'),
          trx.raw('SELECT setval(\'sprout_users_id_seq\', 0)')
        ]);
      });
  });
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    username: user.username,
    password: bcrypt.hashSync(user.password, 1),
    email: user.email,
  }));

  return db
    .into('sprout_users')
    .insert(preppedUsers)
    .then(() => {
      return db.raw('SELECT setval(\'sprout_users_id_seq\', ?)', [
        users[users.length - 1].id
      ]);
    });
}

function makeAuthHeader(user, secret=process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id}, secret, {
    subject: user.username,
    algorithm: 'HS256',
  });
  return `Bearer ${token}`;
}

function seedStudentsAndUsers(db, users, students) {
  return db.transaction(
    async trx => {
      await seedUsers(trx, users);
      await trx.into('sprout_students').insert(students);

      await trx.raw(
        'SELECT setval(\'sprout_students_id_seq\', ?)',
        [students[students.length -1].id]
      );
    });
}

module.exports = {
  makeUsersArray,
  makeStudentsArray,
  makeAll,
  cleanTables,
  seedUsers,
  makeAuthHeader,
  seedStudentsAndUsers,

};
