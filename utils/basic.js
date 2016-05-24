var
  md5 = require('md5'),
  assert = require('assert'),
  fs = require('fs'),
  assert = require('assert'),
  mailer = require('nodemailer'),
  mongodb = require('mongodb'),
  express = require('express'),
  app = express(),
  http = require('http').createServer(app),
  io = require('socket.io')(http),
  MongoClient = mongodb.MongoClient,
  ObjectId = mongodb.ObjectID,
  smtpTransport = mailer.createTransport('SMTP',{
    service: 'Gmail',
    auth: {
      user: 'game.engine.overrun@gmail.com',
      pass: 'u235cmGE'
    }
  });

module.exports = {
  md5: md5,
  assert: assert,
  mongodb: mongodb,
  MongoClient: MongoClient,
  assert: assert,
  ObjectId: ObjectId,
  fs: fs,
  assert: assert,
  mailer: mailer,
  mongodb: mongodb,
  express: express,
  app: app,
  http: http,
  io: io,
  shoutPortNumber: function () {
    // console.log(__l + ': Server listening at port %d', port);
  },
  sendEventToUser: function (aData) {
    var
      socketID = aData.socketID,
      event = 'some event',
      data = {
        empty: 'empty'
      };

    if (io.sockets.connected[socketID]) {
      io.sockets.connected[socketID].emit(event, data);
    }
  },
  sendConnectionData: function (socket) {
    var dir = __dirname + '/../templates/', templates = {};
    fs.readdir(dir, function (aErr, aFiles) {
      aFiles.forEach(function (fileToRead) {
        fs.readFile(dir + fileToRead, 'utf8', function (aErr, aContent) {
          templates[fileToRead.split('.tmpl')[0]] = aContent;
          if (aFiles.length === (aFiles.indexOf(fileToRead) + 1)) {
            socket.emit('connected', {
              socketID: socket.id,
              templates: templates
            });
          }
        });
      });
    });
  },
  vomitUser: function (aUserID, db) {
    console.log('vomitUserID: ',  aUserID);
    var search = {_id: ObjectId(aUserID)};
    db.collection('users').find(search).each(function(err, user) {
        assert.equal(err, null);
        if (user !== null) {
          console.log(__l + ': ', user);
        }
    });
  },
  clearCollection: function(aCollectionName, db) {
    db.collection(aCollectionName).deleteMany( {}, function(err, results) {
      // db.collection(aCollectionName).dropIndexes();
   });
  },
  sendWelcomeMail: function (user) {
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
  getSocketClients: function (io) {
    return Object.keys(io.clients().sockets);
  },
  prepUser: function (aUser, aSocket) {
    var user = {
      email: aUser.username,
      username: aUser.username.split('@')[0],
      password: md5(aUser.password),
      socketID: aSocket.id,
      loggedIn: false
    };
    return user;
  },
  globalStack: Object.defineProperty(global, '__stack', {
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
  globalLine: Object.defineProperty(global, '__l', {
    get: function(){
      return __stack[1].getLineNumber();
    }
  })
};
