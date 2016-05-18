var
  utils1 = require('./utils/guy'),
  utils2 = require('./utils/anre'),
  md5 = utils1.md5,
  commands = utils1.commands,
  prepUser = utils1.prepUser,
  fs = require('fs'),
  express = require('express'),
  app = express(),
  http = require('http').createServer(app),
  io = require('socket.io')(http),
  port = process.env.PORT || 3000,
  connectionCnt = 0,
  gActiveUsers = {},
  gTemplates = {},
  mongodb = require('mongodb'),
  MongoClient = mongodb.MongoClient,
  ObjectId = mongodb.ObjectID,
  getSocketClients = function () {
    return Object.keys(io.clients().sockets);
  },
  assert = require('assert'),
  dbName = 'test',
  dbUrl = 'mongodb://localhost:27017/' + dbName,
  db,
  mailer = require('nodemailer'),
  clearUserDB = false,
  globalStack = utils1.a,
  globalLine = utils1.b,
  moves = {
    37: 'left',
    38: 'forward',
    39: 'right',
    40: 'back'
  },

  // Use Smtp Protocol to send Email
  smtpTransport = mailer.createTransport('SMTP',{
    service: 'Gmail',
    auth: {
      user: 'game.engine.overrun@gmail.com',
      pass: 'u235cmGE'
    }
  }),

  vomitUser = function (aUserID) {
    console.log('vomitUserID: ',  aUserID);
    var search = {_id: ObjectId(aUserID)};
    db.collection('users').find(search).each(function(err, user) {
        assert.equal(err, null);
        if (user !== null) {
          console.log(__l + ': ', user);
        }
    });
  },

  sendConnectionData = function (socket) {
    fs.readdir(__dirname + '/templates', function (aErr, aFiles) {
      aFiles.forEach(function (fileToRead) {
        fs.readFile(__dirname + '/templates/' + fileToRead, 'utf8', function (aErr, aContent) {

          gTemplates[fileToRead.split('.tmpl')[0]] = aContent;
          if (aFiles.length === (aFiles.indexOf(fileToRead) + 1)) {
            socket.emit('connected', {
              socketID: socket.id,
              templates: gTemplates
            });
          }
        });
      });
    });
  },

  shoutPortNumber = function () {
    // console.log(__l + ': Server listening at port %d', port);
  },

  clearCollection = function(aCollectionName) {
    db.collection(aCollectionName).deleteMany( {}, function(err, results) {
      // console.log(results);
   });
  },

  sendWelcomeMail = function (user) {
    mail = {
      from: 'Guy Murray <gm.overrun@gmail.com>',
      to: 'gm.overrun+nodeUser@gmail.com',
      subject: 'Welcome to game engine',
      text: 'Welcome, ' + user.username,
      html: 'Welcome, <b>' + user.username + '</b>'
    };

    smtpTransport.sendMail(mail, function(error, response){
      if (error) {
        console.log(error);
        return false;
      }
      else {
        console.log("Message sent: " + response.message);
        return true;
      }
      smtpTransport.close();
    });
  },

  clientCommands = {
    moveButton: function (aData, socket) {
      var returnData = {}, direction = moves[aData.keyNum];

      returnData = {
        success: 'moveButton',
        data: aData,
        direction: direction
      };

      returnData.message = 'a client has moved the button[' + direction + ']';
      returnData.notMe = true;
      socket.broadcast.emit('success', returnData);

      returnData.message = 'you have moved the button[' + direction + ']';
      returnData.notMe = false;
      socket.emit('success', returnData);
    },

    takeControl: function (aData, socket) {
      var
        returnData = {},
        userID = aData.userID,
        searchBy= {
          _id: ObjectId(userID)
        };
      // update user set which button he is looking at
      db.collection('users').update(
        searchBy, {
          $set:{
            'buttonNum': aData.padNum
          }
        }
      );

      // vomitUser(userID);

      returnData = {
        success: 'takeControl',
        data: aData
      };

      returnData.message = 'a client has taken control of a button[' + aData.padNum + ']';
      returnData.notMe = true;
      socket.broadcast.emit('success', returnData);

      returnData.message = 'you has taken control of button[' + aData.padNum + ']';
      returnData.notMe = false;
      socket.emit('success', returnData);
    },

    padClick: function (aData, socket) {
      var returnData = {};

      returnData = {
        success: 'padClick',
        message: 'a client clicked a button[' + aData.padNum + ']',
        data: aData
      };
      socket.broadcast.emit('success', returnData);
      socket.emit('success', returnData);
    },

    getUsers: function (aData, socket) {
      var search = {};
      db.collection('users').find(search).each(function(err, user) {
        var returnData;
          assert.equal(err, null);
          if (user !== null) {
            returnData = {
              success: 'getUsers',
              message: 'loading user list',
              user: user
            };
            socket.broadcast.emit('success', returnData);
            socket.emit('success', returnData);
          }
      });
    },

    signUp: function (aData, socket) {
      var
        user = prepUser(aData, socket),
        returnData = {};
      db.collection('users').insertOne(user, function(err, result) {
        if (err === null && result.insertedCount === 1) {
          user = result.ops[0];
          socket.emit('success', {
            success: 'signUp',
            message: 'Congratulations you have been signed up',
            user: user
          });
          // sendWelcomeMail(user);
        }
        else {
          console.log('Username is already taken.');
          socket.emit('failure', {
            failure: 'signUp',
            message: 'Username is already taken.'
          });
        }
     });
    },

    logout: function (aData, socket) {
      var returnData = {}, userID = aData.userID, loggedInUser, searchBy;

      if (userID && userID.toString() === socket.userID.toString()) {
        // console.log(__l + 'logout time', aData);

        searchBy = {
          _id: ObjectId(userID)
        };

        // db.collection('users').findOne(searchBy).then(function (loggedInUser) {
        db.collection('users').findAndModify(
          searchBy, // query
          [],  // sort order
          {$set: {loggedIn: false}}, // replacement, replaces only the field "hi"
          {}
        ).then(function (loggedInUser) {
          var user = loggedInUser.value;
          if (loggedInUser.ok) {
            delete gActiveUsers[socket.id];
            socket.userLoggedIn = false;
            returnData = {
              success: 'logout',
              message: 'user: ' + userID + ' has logged out',
              userID: userID
            };
            socket.broadcast.emit('success', returnData);
            socket.emit('success', returnData);
          }
        });
      }
      else {
        // console.log('failed to log out');
        returnData = {
          failure: 'logout',
          message: 'failed to log out',
          userID: userID
        };
        socket.emit('failure', returnData);
      }
    },

    login: function (aData, socket) {
      var
        user = aData,
        returnData = {},
        loggedInUser,
        searchBy;

      searchBy = aData._id === undefined ? {
        password: md5(user.password),
        email: user.username
      } : {
        "_id": ObjectId(aData._id)
      };

      // db.collection('users').findOne(searchBy).then(function (loggedInUser) {
      db.collection('users').findAndModify(
        searchBy, // query
        [],  // sort order
        {$set: {loggedIn: true}}, // replacement, replaces only the field "hi"
        {}
      ).then(function (loggedInUser) {
        var user = loggedInUser.value;
        // we have the user
        if (loggedInUser.ok) {
          // user
          console.log(__l + ': Welcome back ' + user.username);
          user.socketID = socket.id;

          socket.userID = user._id;
          socket.userLoggedIn = true;

          gActiveUsers[socket.id] = user;

          // console.log(__l + ': login active sockets: ', getSocketClients());
          // console.log(__l + ': login activeUsers keys: ', Object.keys(gActiveUsers));

          socket.emit('success', {
            success: 'login',
            user: user,
            users: gActiveUsers
          });
        }
        else {
          socket.emit('failure', {
            failure: 'login',
            user: user,
            message: 'no user with those details exist'
          });
        }
      });
    }
  },

  sendEventToUser = function (aData) {
    var
      socketID = aData.socketID,
      event = 'some event',
      data = {
        empty: 'empty'
      };

    if (io.sockets.connected[socketID]) {
      io.sockets.connected[socketID].emit(event, data);
    }
  };

// connect to mongo database and create db object
MongoClient.connect(dbUrl, function (err, aDb) {
  assert.equal(null, err);
  db = aDb;
  // console.log(__l + ': Connected correctly to dbUrl: ' + dbUrl);

  // clear user db
  if (clearUserDB) {
    clearCollection('users');

    // db.collection('users')
    db.collection('users').dropIndexes();
    db.collection('users').createIndex( { username: 1 }, { unique: true } );
    // db.users.createIndex( { "": 1 }, { unique: true } )
  }
  // start listening on port
  http.listen(port, shoutPortNumber);

  // Routing for files and stuff
  app.use(express.static(__dirname + '/public'));

  // check when a user connects
  io.on('connection', function (socket) {
    socket.userLoggedIn = false;
    socket.broadcast.emit('a client connected on socket: ', socket.id);

    sendConnectionData(socket);

    // listen for 'command' event from user on socket
    socket.on('command', function (aData) {
      var command = aData.command;
      // run the client command
      // console.log(__l + ': command', aData)
      if (clientCommands[command]) {
        clientCommands[command](aData.data, socket);
      }
      else {
        console.log(__l + ': wtf', command);
      }
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function () {
      if (gActiveUsers[socket.id]) {
        delete gActiveUsers[socket.id];
        clientCommands.getUsers({disconnect: true}, socket);
        // console.log(__l + ': disconnect active sockets: ', Object.keys(io.clients().sockets));
        // console.log(__l + ': disconnect activeUsers keys: ', Object.keys(gActiveUsers));
      }
    });
  });
});
