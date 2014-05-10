var Sequelize = require('sequelize');
var _ = require('underscore');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

// the following thing takes in db name, user, pw
var sequelize = new Sequelize('ormchat', 'root', '', {
  dialect: 'mysql',
  port: 3306
});

sequelize.authenticate().complete(function(err) {
  if (!!err) {
    console.log('Unable to connect to the database:', err);
  } else {
    console.log('Connection has been established successfully.');
  }
});

// sequelize automatically adds columns for id, createdAt, and updatedAt
var Messages = sequelize.define('Messages', {
  body: Sequelize.STRING
});

var Users = sequelize.define('Users', {
  name: Sequelize.STRING
});

var Rooms = sequelize.define('Rooms', {
  name: Sequelize.STRING
});

Users.hasOne(Messages, {foreignKey: 'userId', foreignKeyConstraint: true});
Rooms.hasOne(Messages, {foreignKey: 'roomId', foreignKeyConstraint: true});
Messages.belongsTo(Users, {foreignKey: 'userId', as: 'User'});
Messages.belongsTo(Rooms, {foreignKey: 'roomId', as: 'Room'});

sequelize.sync();

// http://stackoverflow.com/questions/20156045/get-values-from-associated-table-with-sequelize-js


var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
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
app.options('/:room', function(req, res) {
  console.log('OPTIONS');
  res.status(200);
  res.end();
});

// Post
app.post('/:room', bodyParser(), function(req, res) {
  req.body.username = req.body.username || 'kewlKid';
  req.body.roomname = req.params.room;
  console.log('POST');
  Users.findOrCreate({name: req.body.username}).success(function(user) {
    Rooms.findOrCreate({name: req.body.roomname}).success(function(room) {
      Messages.create({
        userId: user.id,
        roomId: room.id,
        body: req.body.message
      }).success(function(message) {
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
app.get('/:room', function (req, res) {
  Rooms.find({
    where: { name: req.params.room }
  }).success(function(room) {
    Messages.findAll({
      where: { roomId: room.id },
      include: [
        {model: Users, as: 'User'},
        {model: Rooms, as: 'Room'}
      ]
    }).success(function(messages) {
      messages = _.map(messages, function(message) {
        var obj = {};
        obj.username = message.user.name;
        obj.roomname = message.room.name;
        obj.message = message.body;
        obj.createdAt = message.createdAt;
        obj.updatedAt = message.updatedAt;
        return obj;
      });
      res.status(200);
      res.end(JSON.stringify(messages));
    });
  });
});

// Serve static files from /client
app.use('/', express.static(__dirname + '/client'));

var server = app.listen(port, function() {
  console.log("Listening on http://127.0.0.1:%d", server.address().port);
});
