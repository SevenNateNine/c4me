-- c4me database schema.
--
--   mysql -u root -p < schema.sql
--
-- Derived from the columns the application actually reads and writes. It
-- replaces the earlier sqlstatements.txt, which could not run the app: it
-- truncated password hashes, omitted two required tables, and interleaved
-- prose with SQL so it could not be piped to a client.

CREATE DATABASE IF NOT EXISTS c4me
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE c4me;

-- ---------------------------------------------------------------------------
-- Accounts
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS User (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_name   VARCHAR(50)  NOT NULL,
  -- bcrypt emits a 60-character hash. The previous VARCHAR(50) silently
  -- truncated every stored hash, which corrupts verification.
  password    VARCHAR(255) NOT NULL,
  type        ENUM('Student', 'Admin') NOT NULL,
  first_name  VARCHAR(50),
  last_name   VARCHAR(50),
  email       VARCHAR(255),
  -- Registration rejects duplicate usernames on this constraint.
  UNIQUE KEY uq_user_name (user_name)
);

CREATE TABLE IF NOT EXISTS Admin (
  id INT PRIMARY KEY,
  FOREIGN KEY (id) REFERENCES User(id) ON DELETE CASCADE
);

-- Server-side session records. A JWT is only accepted while a row here matches
-- both its id and its random_val, which is what makes logout able to revoke a
-- token that has not yet expired. Written with REPLACE INTO, so id is the key.
CREATE TABLE IF NOT EXISTS LoggedIn (
  id         INT PRIMARY KEY,
  random_val INT NOT NULL,
  FOREIGN KEY (id) REFERENCES User(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------------
-- Reference data
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS HighSchool (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  name               VARCHAR(255) NOT NULL,
  city               VARCHAR(255) NOT NULL,
  state              CHAR(2),
  ap_enroll          DOUBLE,
  sat_score          INT,
  act_score          INT,
  college_prep_rank  INT,
  us_rank            INT,
  stem_rank          INT,
  -- Comma-joined scraper output; ten college names overflow VARCHAR(255).
  interested_schools TEXT,
  interested_majors  TEXT,
  -- insertHS treats this triple as the identity of a school.
  UNIQUE KEY uq_highschool (name, city, state)
);

CREATE TABLE IF NOT EXISTS School (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  name                  VARCHAR(255) NOT NULL,
  city                  VARCHAR(255),
  state                 CHAR(2),
  region                ENUM('Northeast', 'Midwest', 'South', 'West'),
  admission_rate        DOUBLE,
  cost                  DOUBLE,
  ranking               INT,
  size                  INT,
  act_composite         INT,
  sat_math              INT,
  sat_ebrw              INT,
  act_range_low         INT,
  act_range_high        INT,
  sat_math_range_low    INT,
  sat_math_range_high   INT,
  sat_ebrw_range_low    INT,
  sat_ebrw_range_high   INT,
  avg_accepted_gpa      FLOAT,
  -- The scrapers upsert with ON DUPLICATE KEY UPDATE keyed on the name. Without
  -- this constraint every scrape run appends a fresh copy of every school.
  UNIQUE KEY uq_school_name (name)
);

CREATE TABLE IF NOT EXISTS Majors (
  school_id INT NOT NULL,
  -- Scraped program names run well past 30 characters
  -- ("Business Administration and Management").
  major     VARCHAR(255) NOT NULL,
  PRIMARY KEY (school_id, major),
  FOREIGN KEY (school_id) REFERENCES School(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------------
-- Student profiles and applications
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS Student (
  id               INT PRIMARY KEY,
  hs_id            INT,
  -- Validated and bound as an integer by the API.
  financial_status INT,
  major1           VARCHAR(255),
  major2           VARCHAR(255),
  grad_year        INT,
  sat_math         INT,
  sat_ebrw         INT,
  act_eng          INT,
  act_math         INT,
  act_reading      INT,
  act_science      INT,
  act_comp         INT,
  sat_lit          INT,
  sat_us           INT,
  sat_mathI        INT,
  sat_mathII       INT,
  sat_eco          INT,
  sat_mol          INT,
  sat_chem         INT,
  sat_phy          INT,
  numAPs           INT,
  gpa              FLOAT,
  FOREIGN KEY (id) REFERENCES User(id) ON DELETE CASCADE,
  FOREIGN KEY (hs_id) REFERENCES HighSchool(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS Applications (
  student_id   INT NOT NULL,
  college_id   INT NOT NULL,
  status       ENUM('Pending', 'Waitlisted', 'Accepted', 'Rejected', 'Deferred', 'Withdrawn') NOT NULL,
  -- Set by the flagging logic when a reported acceptance looks implausible
  -- against the school's published ranges.
  questionable BOOLEAN NOT NULL DEFAULT FALSE,
  -- One application per student per school: INSERT ... ON DUPLICATE KEY UPDATE
  -- and INSERT IGNORE both key on this pair.
  PRIMARY KEY (student_id, college_id),
  -- Supports the application-tracker scatter plot, which filters by school.
  -- Declared inline because MySQL has no CREATE INDEX IF NOT EXISTS, and a
  -- standalone statement would make re-running this file an error.
  KEY idx_applications_college (college_id),
  FOREIGN KEY (student_id) REFERENCES Student(id) ON DELETE CASCADE,
  FOREIGN KEY (college_id) REFERENCES School(id) ON DELETE CASCADE
);
