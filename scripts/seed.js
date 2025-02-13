import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbConfigPath = path.join(__dirname, '../database.yaml');
const dbConfig = yaml.load(fs.readFileSync(dbConfigPath, 'utf8'));

const {
  'sqlite_path': sqlitePath,
} = dbConfig;

const db = new sqlite3.Database(sqlitePath);

const employees = [
  {
    full_name: 'John Doe',
    phone_number: '123-456-7890',
    email: 'john.doe@example.com',
    address: '123 Main St',
    employee_imgSrc: '/uploads/photos/john_doe.jpg',
    employee_cv: '/uploads/cvs/john_doe.pdf',
    date_of_birth: '1990-05-15',
    salary: 60000
  },
  {
    full_name: 'Jane Smith',
    phone_number: '987-654-3210',
    email: 'jane.smith@example.com',
    address: '456 Elm St',
    employee_imgSrc: '/uploads/photos/jane_smith.jpg',
    employee_cv: '/uploads/cvs/jane_smith.pdf',
    date_of_birth: '1992-08-22',
    salary: 65000
  },
  {
    full_name: 'Alice Johnson',
    phone_number: '555-555-5555',
    email: 'alice.johnson@example.com',
    address: '789 Oak St',
    employee_imgSrc: '/uploads/photos/alice_johnson.jpg',
    employee_cv: '/uploads/cvs/alice_johnson.pdf',
    date_of_birth: '1985-02-10',
    salary: 70000
  }
];


const timesheets = [
  {
    employee_id: 1,
    start_time: '2025-02-10 08:00:00',
    end_time: '2025-02-10 17:00:00',
    summary: 'Completed project design and team meeting.'
  },
  {
    employee_id: 2,
    start_time: '2025-02-11 12:00:00',
    end_time: '2025-02-11 17:00:00',
    summary: 'Worked on frontend components for EMS.'
  },
  {
    employee_id: 3,
    start_time: '2025-02-12 07:00:00',
    end_time: '2025-02-12 16:00:00',
    summary: 'Backend integration and testing.'
  }
];


const insertData = (table, data) => {
  const columns = Object.keys(data[0]).join(', ');
  const placeholders = Object.keys(data[0]).map(() => '?').join(', ');

  const insertStmt = db.prepare(`INSERT INTO ${table} (${columns}) VALUES (${placeholders})`);

  data.forEach(row => {
    insertStmt.run(Object.values(row));
  });

  insertStmt.finalize();
};

db.serialize(() => {
  insertData('employees', employees);
  insertData('timesheets', timesheets);
});

db.close(err => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Database seeded successfully.');
  }
});

