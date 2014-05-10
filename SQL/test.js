var mysql = require('mysql');
var _ = require('underscore');

var dbConnection = mysql.createConnection({
  user: "root",
  password: "",
  database: "chat"
});

dbConnection.connect();

var insert = _.template(
  'INSERT INTO Users(name) values(\'<%= username %>\');' +
  'INSERT INTO Rooms(name) values(\'<%= roomname %>\');' +
  'INSERT INTO Messages(body, userId, roomId) ' +
  'values(\'<%= body %>\', '+
    '(SELECT ID FROM Users where name = \'<%= username %>\'), ' +
    '(SELECT ID FROM Rooms where name = \'<%= roomname %>\')' +
  ');'
);

// var statement = insert({
//   username: 'amira',
//   roomname: 'hr',
//   body:     'a message'
// });
// debugger;
// dbConnection.query(statement, function(err, row, fields) {
//   debugger;
// });

dbConnection.query('SELECT * from Messages', function (err, rows, fields) {
  debugger;
});
