var
  // load utility things
  utils = require('./utils/basic'),
  // get the client commands
  clientCommands = require('./utils/clientCommands'),
  port = process.env.PORT || 3000,
  gUsers = {},
  allClients = [],
  dbUrl = 'mongodb://localhost:27017/test',
  clearUserDB = true;

// connect to mongo database and create db object
utils.MongoClient.connect(dbUrl, function (err, db) {
  // shout about errors
  utils.assert.equal(null, err);
  // clear user db
  if (clearUserDB) {
    // clear the db and remove indexs
    utils.clearCollection('users', db);
    // create the unique index for users collection on username
    db.collection('users').createIndex({ username: 1 }, { unique: true });
  }
  // start listening on port
  utils.http.listen(port, utils.shoutPortNumber);
  // Routing for files and stuff
  utils.app.use(utils.express.static(__dirname + '/public'));
  // check when a user connects
  utils.io.on('connection', function (socket) {
    //socket to client list
    allClients.push(socket);
    // set loggedIn flag on socket when a client connects
    socket.loggedIn = false;
    // send the connecting client templates and stuff
    utils.sendConnectionData(socket);
    // listen for 'command' event from user on socket
    socket.on('command', function (aData) {
      var command = clientCommands[aData.command];
      // check if we have the command
      if (command) {
        // run the client command
        command(aData.data, socket, db, gUsers);
      }
      else {
        console.log(__l + ': wtf', aData.command);
      }
    });
    // when the user disconnects.. perform this
    socket.on('disconnect', function () {
      // remove the client fromt he list
      allClients.splice(allClients.indexOf(socket), 1);
      if (gUsers[socket.userID]) {
        console.log('disconnect', socket.userID);
        // remove the user from global user list
        delete gUsers[socket.userID];
        // set the user to logged out in the db
        db.collection('users').update({
          _id: socket.userID}, {$set: {loggedIn: false}
        }, function () {
          // send updated user list to clients
          clientCommands.getUsers({disconnect: true}, socket, db, gUsers);
        });
      }
    });
  });
});
