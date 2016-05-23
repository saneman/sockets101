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
  gUsers = {},
  gTemplates = {},
  mongodb = require('mongodb'),
  MongoClient = mongodb.MongoClient,
  ObjectId = mongodb.ObjectID,
  getSocketClients = function () {
    return Object.keys(io.clients().sockets);
  },
  allClients = [],
  assert = require('assert'),
  dbName = 'test',
  dbUrl = 'mongodb://localhost:27017/' + dbName,
  db,
  mailer = require('nodemailer'),
  clearUserDB = true,
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
      console.log(__l + ': get users');
      var search = {};
      db.collection('users').find(search).each(function(err, user) {
        var returnData;
          assert.equal(err, null);
          if (user !== null) {

            gUsers[user._id] = user;

            returnData = {
              success: 'getUsers',
              message: 'loading user list',
              user: user,
              users: gUsers
            };
            socket.broadcast.emit('success', returnData);
            socket.emit('success', returnData);
          }
      });
    },

    signup: function (aData, socket) {
      var user = prepUser(aData, socket), returnData = {};
      db.collection('users').insertOne(user, function(err, result) {
        if (err === null && result.insertedCount === 1) {
          user = result.ops[0];
          gUsers[user._id] = user;
          clientCommands.login(user, socket);
        }
        else {
          socket.emit('failure', {
            failure: 'signUp',
            message: 'Username is already taken.'
          });
        }
     });
    },

    logout: function (aData, socket) {
      var
        returnData = {},
        userID = aData.userID,
        searchBy;

      if (userID && userID.toString() === socket.userID.toString()) {
        searchBy = {
          _id: ObjectId(userID)
        };
        // update "loggedIn" flag on user in DB
        db.collection('users').update(
          searchBy, {
            $set:{
              loggedIn: false
            }
          }
        );
        // set flag on user in global list
        gUsers[userID].loggedIn = false;
        // flag on socket to be logged out
        socket.loggedIn = false;
        returnData = {
          success: 'logout',
          message: 'user: ' + userID + ' has logged out',
          userID: userID,
          users: gUsers
        };
        console.log('logging out success');
        // tell everyone ELSE a user has logged out
        socket.broadcast.emit('success', returnData);
        // tell user he has successfully logged out
        socket.emit('success', returnData);
      }
      else {
        console.log('logging out failure');
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

      searchBy = aData._id !== undefined ? {
        "_id": ObjectId(aData._id)
      } : {
        password: md5(user.password),
        email: user.username
      };
      // db.collection(__l + ': users').findOne(searchBy, function (err, loggedInUser) {
      db.collection('users').findAndModify(
        searchBy, // query
        [],  // sort order
        {$set: {loggedIn: true}}, // replacement, replaces only the field "hi"
        {}
      ).then(function (loggedInUser) {
        var user = loggedInUser.value;
        // we have the user
        if (user) {
          // update user in db to be "loggedIn"
          db.collection('users').update(
            {_id: user._id}, {
              $set:{
                loggedIn: true
              }
            }
          );

          console.log(__l + ': Welcome back ' + user.username);
          // set the user id on the socket
          socket.userID = user._id;
          // set the loggedIn flag on the users socket
          socket.loggedIn = true;

          // set socket id on user
          user.socketID = socket.id;
          //set the loggedIn flag on the user
          user.loggedIn = true;

          gUsers[user._id] = user;

          socket.emit('success', {
            success: 'login',
            user: user,
            isUser: true,
            users: gUsers,
            message: 'Welcome back: ' + user.username
          });

          socket.broadcast.emit('success', {
            success: 'login',
            isUser: false,
            user: user,
            users: gUsers,
            message: 'Welcome back: ' + user.username
          });

        }
        else {

          console.log(__l + ': login failure');

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
    var connectionMessage = 'a client connected on socket: ' + socket.id;

    allClients.push(socket);

    socket.loggedIn = false;
    // socket.broadcast.emit();

    sendConnectionData(socket);

    // listen for 'command' event from user on socket
    socket.on('command', function (aData) {
      var command = aData.command;
      // run the client command
      // console.log(__l + ': command', command);

      if (clientCommands[command]) {
        clientCommands[command](aData.data, socket);
      }
      else {
        console.log(__l + ': wtf', command);
      }
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function () {

      var i = allClients.indexOf(socket);
      allClients.splice(i, 1);



      if (gUsers[socket.userID]) {
        console.log('disconnect', socket.userID);
        delete gUsers[socket.userID];
        db.collection('users').update(
          {_id: socket.userID}, {
            $set:{
              loggedIn: false
            }
          }
        );
        clientCommands.getUsers({disconnect: true}, socket);
        // console.log(__l + ': disconnect active sockets: ', Object.keys(io.clients().sockets));
        // console.log(__l + ': disconnect activeUsers keys: ', Object.keys(gUsers));
      }
    });
  });
});
