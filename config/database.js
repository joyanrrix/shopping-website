const mysql = require('mysql2');

var connection = mysql.createConnection({
  host: "1155226868-iems5718.mysql.database.azure.com",
  user: "yang",
  password: "Zhang@1205",
  database: "shop",
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

module.exports = connection;