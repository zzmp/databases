var express = require("express");
var bodyParser = require("body-parser");
var mysql = require("mysql");
var app = express();
var Sequelize = require("sequelize");

// the following thing takes in db name, user, pw
var sequelize = new Sequelize('ormchat', 'root', '', {
  dialect: 'mysql',
  port: 3306
});

sequelize.authenticate().complete(function(err) {
  if (!!err) {
    console.log('Unable to connect to the database:', err)
  } else {
    console.log('Connection has been established successfully.');
  }
});

// sequelize automatically adds columns for id, createdAt, and updatedAt
var Messages = sequelize.define('Messages', {
  body: Sequelize.STRING
});

var Users = sequelize.define('Users', {
  username: Sequelize.STRING
});

var Rooms = sequelize.define('Rooms', {
  roomname: Sequelize.STRING
});

Users.hasOne(Messages, {foreignKey: 'userId', foreignKeyConstraint: true});
Rooms.hasOne(Messages, {foreignKey: 'roomId', foreignKeyConstraint: true});
Messages.belongsTo(Users, {foreignKey: 'userId', as: 'User'});
Messages.belongsTo(Rooms, {foreignKey: 'roomId', as: 'Room'});

sequelize.sync();

// http://stackoverflow.com/questions/20156045/get-values-from-associated-table-with-sequelize-js


var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};

var port = 3000;

var cache = {};
cache.chatterbox = [];

// Set CORS headers
app.use('/', function(req, res, next) {
  console.log('CORS');
  res.set(defaultCorsHeaders);
  if (req.url === '/') {
    req.url = '/lobby';
  }
  next();
});

// Allow CORS
app.options('/:room', function(req, res, next) {
  console.log('OPTIONS');
  res.status(200);
  res.end();
});

// Post
app.post('/:room', bodyParser(), function(req, res, next) {
  req.body.username = req.body.username || 'kewlKid';
  req.body.roomname = req.params.room;
  console.log('POST');
  Users.findOrCreate({username: req.body.username}).success(function(user, created) {
    Rooms.findOrCreate({roomname: req.body.roomname}).success(function(room, created) {
      Messages.create({
        username: user.id,
        roomname: room.id,
        body: req.body.message
      }).success(function(message, created) {
        res.status(201);
        res.end(JSON.stringify({
          id: message.id,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt
        }));
      });
    });
  });
});

// Get
// app.get('/:room')





//   dbConnection.query('INSERT INTO users(name) values(?);', [req.body.username], function(err, rows, fields) {
//     dbConnection.query('INSERT INTO rooms(name) values(?);', [req.body.roomname], function(err, rows, fields) {
//       var statement = 'INSERT INTO messages(body, userId, roomId) ' +
//                       'values(?, ' +
//                         '(SELECT ID FROM Users where name = ?), ' +
//                         '(SELECT ID FROM Rooms where name = ?)' +
//                       ');';
//       dbConnection.query(statement, [req.body.message, req.body.username, req.body.roomname || 'lobby'], function(err, rows, fields) {
//         if (err) {
//           res.status(500);
//           res.end();
//         } else {
//           dbConnection.query('SELECT * FROM messages WHERE id=?;', [rows.insertId], function(err, rows, fields) {
//             if (err) {
//               res.status(500);
//               res.end();
//             } else {
//               res.end(JSON.stringify({results: rows}));
//             }
//           });
//         }
//       });
//     });
//   });
// });

// // Get
// app.get('/:room', function(req, res, next) {
//   console.log('GET');
//   dbConnection.query('SELECT * FROM messages WHERE roomId = ' +
//                     '(SELECT roomId FROM rooms WHERE name=?);', [req.params.room], function(err,rows,fields) {

//     if (err) {
//       res.status(500);
//       res.end();
//     } else if (rows.length === 0 ) {
//       res.status(404);
//       res.end();
//     } else {
//       res.status(200);
//       res.set('Content-Type', 'application/json');
//       res.end(JSON.stringify({results: rows}));
//     }
//   });
// });


// Serve static files from /client
app.use('/', express.static(__dirname + '/client'));

var server = app.listen(port, function() {
  console.log("Listening on http://127.0.0.1:%d", server.address().port);
});
