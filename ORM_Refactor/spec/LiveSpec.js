/* You'll need to have MySQL running and your Node server running
 * for these tests to pass. */

var mysql = require('mysql');
var request = require("request"); // You might need to npm install the request module!
var expect = require('../../node_modules/chai/chai').expect;
var Sequelize = require('sequelize');

describe("Persistent Node Chat Server", function() {
  var dbConnection;

  beforeEach(function(done) {
    dbConnection = mysql.createConnection({
      user: "root",
    /* and password. */
      //password: "",
      database: "chat"
    });
    dbConnection.connect();

    var tablename = "messages";

    /* Empty the db table before each test so that multiple tests
     * (or repeated runs of the tests) won't screw each other up: */
    dbConnection.query("DELETE FROM " + tablename, done);
  });

  afterEach(function() {
    dbConnection.end();
  });

  it("Should connect to the DB", function(done) {
    done();
  })

  it("Should insert posted messages to the DB", function(done) {
    // Post a message to the node chat server:
    request({method: "POST",
             uri: "http://127.0.0.1:3000/chatterbox",
             form: {username: "Valjean",
                    message: "In mercy's name, three days is all I need."}
            },
            function(error, response, body) {
              /* Now if we look in the database, we should find the
               * posted message there. */

              var queryString = "SELECT * FROM messages;";
              var queryArgs = [];
              /* TODO: Change the above queryString & queryArgs to match your schema design
               * The exact query string and query args to use
               * here depend on the schema you design, so I'll leave
               * them up to you. */
              dbConnection.query( queryString, queryArgs,
                function(err, results, fields) {
                  console.log(err, results, fields);
                  // Should have one result:
                  expect(results.length).to.equal(1);
                  //expect(results[0].username).to.equal("Valjean");
                  expect(results[0].body).to.equal("In mercy's name, three days is all I need.");
                  /* TODO: You will need to change these tests if the
                   * column names in your schema are different from
                   * mine! */

                  done();
                });
            });
  });

  xit("Should output all messages from the DB", function(done) {
    // Let's insert a message into the db
    var queryString = 'INSERT INTO messages(body, userId, roomId) ' +
                      'values(?, ' +
                        '(SELECT ID FROM Users where name = ?), ' +
                        '(SELECT ID FROM Rooms where name = ?)' +
                      ');';
    var queryArgs = ["Men like you can never change!","Javert","SexyRoom"];
    /* TODO - The exact query string and query args to use
     * here depend on the schema you design, so I'll leave
     * them up to you. */

    dbConnection.query( queryString, queryArgs,
      function(err, results, fields) {
        /* Now query the Node chat server and see if it returns
         * the message we just inserted: */
        request("http://127.0.0.1:8080/chatterbox",
          function(error, response, body) {
            var messageLog = JSON.parse(body);
            expect(messageLog[0].body).to.equal("Men like you can never change!");
            done();
          });
      });
  });
});
