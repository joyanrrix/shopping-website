import mysql from 'mysql2';

const connection = mysql.createConnection({
  host: "",
  user: "",
  password: "",
  database: "",
  ssl: {
    rejectUnauthorized: true
  }
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database.');
});

export default connection;