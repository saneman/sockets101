// Setup basic express server
var
  express = require('express'),
  app = express(),
  http = require('http').createServer(app),
  io = require('socket.io')(http),
  port = process.env.PORT || 3000,
  connectionCnt = 0,
  users = [],
  MongoClient = require('mongodb').MongoClient,
  assert = require('assert'),
  dbUrl = 'mongodb://localhost:27017/test',
  db,
  mailer = require('nodemailer'),
  clearUserDB = false,
  a = Object.defineProperty(global, '__stack', {
    get: function(){
      var orig = Error.prepareStackTrace;
      Error.prepareStackTrace = function(_, stack){ return stack; };
      var err = new Error;
      Error.captureStackTrace(err, arguments.callee);
      var stack = err.stack;
      Error.prepareStackTrace = orig;
      return stack;
    }
  }),
  b = Object.defineProperty(global, '__l', {
    get: function(){
      return __stack[1].getLineNumber();
    }
  }),
  // l = __line + ': ',
  // clearUserDB = true,

  // Use Smtp Protocol to send Email
  smtpTransport = mailer.createTransport('SMTP',{
    service: 'Gmail',
    auth: {
      user: 'game.engine.overrun@gmail.com',
      pass: 'u235cmGE'
    }
  }),

  shoutPortNumber = function () {
    console.log('Server listening at port %d', port);
  },

  removeUser = function (aData) {
    var
      data,
      socket = aData.socket,
      username = socket.username,
      userAlreadyAdded = aData;

    if (userAlreadyAdded) {
      // users = users.splice(users.indexOf(username), 1);
      data = {
        username: username,
        users: users
      };
      // deleteUser(aData);
      // echo globally that this client has left
      socket.broadcast.emit('user left', data);
    }
  },

  removeAllUsers = function() {
     db.collection('users').deleteMany( {}, function(err, results) {
        // console.log(results);
     });
  };

  login = function (aData) {
    var
      data,
      user = aData.user,
      socket = aData.socket,
      username = user.username,
      userAlreadyAdded = aData.userAlreadyAdded,
      userID,
      mail;

    console.log(__l + ': login attempt by user: ', user.username);

    insertUser({user: aData.user, socket: socket});

    // get al users
    users = getAllUsers();

    //check if user is in db
    user = getUser(aData.user);




    console.log(__l + ': checking db user: ', user);
    console.log(__l + ': users: ', users);

    // not insert user into db
    // if (!user) {
    //   insertUser({user: aData.user, socket: socket});
    // }
    // else {
    //   console.log('already have user: ' + user);
    // }


    // user = {
    //   ID: userID,
    //   username: username
    // };
    //
    // users.push(user);

    if (!userAlreadyAdded) {
      data = {
        username: username,
        users: users,
        userAlreadyAdded: true
      };

      // console.log('new user');
      // we store the username in the socket session for this client
      socket.username = username;
      userAlreadyAdded = true;
      socket.emit('login', data);

      // echo globally (all clients) that a person has connected
      socket.broadcast.emit('user joined', data);
    }
    else {
      console.log('userAlreadyAdded: false');
      return;
    }
  },

  newMessage = function (aData) {
    var
      socket = aData.socket,
      message = aData.message;

    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      userID: socket.id,
      message: message
    });
  },

  deleteUser = function (aData) {
    var username = aData.socket.username;
    db.collection('users').remove( {
      'username': username
    }, function(err, result) {
     assert.equal(err, null);
     console.log("deleted user: " + username);
    });
  },

  sendWelcomeMail = function (user) {
    mail = {
      from: 'Guy Murray <gm.overrun@gmail.com>',
      to: 'gm.overrun+nodeUser@gmail.com',
      subject: 'Welcome to game engine',
      text: 'Welcome, ' + user.username,
      html: 'Welcome, <b>' + user.username + '</b>'
    }

    smtpTransport.sendMail(mail, function(error, response){
      if(error){
        console.log(error);
        return false;
      }else{
        console.log("Message sent: " + response.message);
        return true;
      }
      smtpTransport.close();
    });
  },

  insertUser = function(aData) {
    var user = aData.user;

    console.log('insert user: ', user);

    db.collection('users').insertOne(user, function(err, result) {
      assert.equal(err, null);

      console.log(__l + ": Inserted user [result]: " + result);


      // sendWelcomeMail(user);


      console.log(__l + ': users', getAllUsers());



   });
  },

  getUser = function(aData) {
    var
      foundUser = false,
      search = db.collection('users').find({
        username: aData.username,
        password: aData.password
      });

    // console.log('looking for user', aData);

    search.each(function(err, user) {
      assert.equal(err, null);
      if (user != null) {
        // console.log('foundUser: ', user);
        foundUser = user;
      }
    });
    return foundUser;
  },

  getAllUsers = function() {
    var
      users = [],
      search = db.collection('users').find();

    search.each(function(err, user) {
      assert.equal(err, null);
      if (user != null) {
        // console.log('getAllUsers user', user);
        // users[user._id] = user;
        users.push(user);
      }
    });
    return users;
  },

  findRestaurants = function(db, callback) {
    var cursor =db.collection('restaurants').find( );
    cursor.each(function(err, doc) {
      assert.equal(err, null);
      if (doc != null) {
        console.dir(doc);
      } else {
        callback();
      }
    });
  };



// console.log(__line);




// connect to mongo database and create db object
MongoClient.connect(dbUrl, function(err, aDb) {
  assert.equal(null, err);
  db = aDb;
  console.log("Connected correctly to server.", dbUrl);

  //clear user db
  if (clearUserDB) {
    removeAllUsers();
  }

  // start listening on port
  http.listen(port, shoutPortNumber);

  // Routing for files and stuff
  app.use(express.static(__dirname + '/public'));

  // check when a user connects
  io.on('connection', function (socket) {
    var
      userAlreadyAdded = false;

    //increment the number of connections
    connectionCnt++;

    // when the client emits 'add user', this listens and executes
    socket.on('add user', function (user) {



      login({
        socket: socket,
        user: user,
        userAlreadyAdded: userAlreadyAdded
      });
    });




    // console.log('connection: ' + connectionCnt);

    //check if user is in db


//

    // when the client emits 'new message', this listens and executes
    socket.on('new message', function (aData) {
      newMessage({socket: socket, message: aData});
    });







    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', function () {
      // typingOnOff({event: 'typing', username: socket.username, socket: socket});
      socket.broadcast.emit('typing', {username: socket.username});
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', function () {
      // typingOnOff({event: 'stop typing', username: socket.username, socket: socket});
      socket.broadcast.emit('stop typing', {username: socket.username});
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function () {
      removeUser({socket: socket, userAlreadyAdded: userAlreadyAdded});
    });
  });
});
