CREATE TABLE sprout_users (
  id SERIAL PRIMARY KEY,
  user_name TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  date_created TIMESTAMP NOT NULL DEFAULT now(),
  date_modified TIMESTAMP
);

ALTER TABLE sprout_students
  ADD COLUMN
    user_id INTEGER REFERENCES sprout_users(id)
    ON DELETE SET NULL;