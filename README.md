# Sprout

## Motivation:
Every day teachers are striving to give their students specific, timely, and goal-oriented feedback to adhere to teaching best practices and nurture the understanding of their students.  

With the increasing pressures of curriculum, standardized testing, and behavior management - Sprout is built to help teachers organize their feedback, set specific goals for each student, and give reminders to check back in a timely manner.  Right now, Sprout focuses on elementary school classrooms.

#### Live Link: [Sprout App]()

## Summary:
Sprout helps teachers give their students specific, timely, and goal-oriented feedback.  Sprout let's teachers add students from their class (right now only supports one class, multiple class support in the works).  Each student is displayed on a card along with their current goal and goal priority.  By clicking the `Check In` button, the card expands and allows teachers to update the student's goal and set a new priority.  

All priorities have a timer attached.  Currently `high priority` goals alert the teacher to check back in after `5 minutes`.  `Medium priority` goals expire in `10 minutes`, and `low priority` in `20 minutes`.  These are set timers for now, customizable timers are in the works.

## Demo Account:
See what Sprout has to offer by using these login credentials:

### *Username: Teacher1*
### *Password: Teacher1pass!*

## Screenshots:
*insert screenshots here*

## API Documentation:

## Technology/Frameworks Used:
- Express
- PostgreSQL
- React using [Create React App](https://github.com/facebook/create-react-app).

## Installation:
### [Sprout Server](https://github.com/WhitneySamWallace/Sprout-Server)
- Install dependencies: `npm install`
- Create development and test databases: `createdb sprout`, `createdb sprout-test`
- Create database user: `postgres`
- Grant privileges to new user in `psql`:
  - `GRANT ALL PRIVILEGES ON DATABASE sprout TO postgres`
  - `GRANT ALL PRIVILEGES ON DATABASE sprout-test TO postgres`
- Prepare environment file: `cp exmaple.env .env`
  - Replace values in `.env` with your custom values if necessary.
- Bootstrap development database: `MIGRATION_DB_NAME=sprout npm run migrate`
- Bootstrap test database: `MIGRATION_DB_NAME=sprout-test npm run migrate`
- To seed the database for development: `psql -U postgres -d sprout -f ./seeds/seed.sprout_users.sql` and `psql -U postgres -d sprout -f ./seeds/seed.sprout_students.sql`
- Start the server for development: `npm run dev`

### [Sprout Client]()
- Install dependencies: `npm install`
- Start the application for development: `npm start`

## Credits:
Created by Whitney Wallace 
- [Portfolio](https://thinkful-ei-emu.github.io/portfolio-whitney/)
- Twitter: [@ThatWhitneySam](https://twitter.com/ThatWhitneySam)

