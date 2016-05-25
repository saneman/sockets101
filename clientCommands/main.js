var
  signup = require('./signup'),
  login = require('./login'),
  getUsers = require('./get-users');
module.exports = {
  signup: signup,
  login: login,
  getUsers: getUsers
};
  // this.login = require('./login')
  // ,
  // moveButton: function (aData, socket, db, gUsers) {
  //   var
  //     returnData = {},
  //     moves = {
  //       37: 'left',
  //       38: 'forward',
  //       39: 'right',
  //       40: 'back'
  //     },
  //     direction = moves[aData.keyNum];
  //
  //   returnData = {
  //     success: 'moveButton',
  //     data: aData,
  //     direction: direction
  //   };
  //
  //   returnData.message = 'a client has moved the button[' + direction + ']';
  //   returnData.notMe = true;
  //   socket.broadcast.emit('success', returnData);
  //
  //   returnData.message = 'you have moved the button[' + direction + ']';
  //   returnData.notMe = false;
  //   socket.emit('success', returnData);
  // },
  // takeControl: function (aData, socket, db, gUsers) {
  //   var
  //     returnData = {},
  //     userID = aData.userID,
  //     findWhere = {_id: ObjectId(userID)},
  //     setData = {'buttonNum': aData.padNum};
  //   // update user set which button he is looking at
  //   db.collection('users').update(findWhere, {$set: setData}, function () {
  //       // vomitUser(userID);
  //       returnData = {
  //         success: 'takeControl',
  //         data: aData
  //       };
  //
  //       returnData.message = 'a client has taken control of a button[' + aData.padNum + ']';
  //       returnData.notMe = true;
  //       socket.broadcast.emit('success', returnData);
  //
  //       returnData.message = 'you has taken control of button[' + aData.padNum + ']';
  //       returnData.notMe = false;
  //       socket.emit('success', returnData);
  //     }
  //   );
  // },
  //
  // padClick: function (aData, socket, db, gUsers) {
  //   var
  //     returnData = {
  //       success: 'padClick',
  //       message: 'a client clicked a button[' + aData.padNum + ']',
  //       data: aData
  //     };
  //   socket.broadcast.emit('success', returnData);
  //   socket.emit('success', returnData);
  // },
  //
  // getUsers: function (aData, socket, db, gUsers) {
  //   console.log(__l + ': get users');
  //   var findWhere = {};
  //   db.collection('users').find(findWhere).each(function(err, user) {
  //     var returnData;
  //       assert.equal(err, null);
  //       if (user !== null) {
  //         gUsers[user._id] = user;
  //         returnData = {
  //           success: 'getUsers',
  //           message: 'loading user list',
  //           user: user,
  //           users: gUsers
  //         };
  //         socket.broadcast.emit('success', returnData);
  //         socket.emit('success', returnData);
  //       }
  //   });
  // },
  //
  // signup: function (aData, socket, db, gUsers) {
  //   var user = prepUser(aData, socket), returnData = {};
  //   db.collection('users').insertOne(user, function(err, result) {
  //     if (err === null && result.insertedCount === 1) {
  //       user = result.ops[0];
  //       gUsers[user._id] = user;
  //       console.log(__l + ': trying to login: ', user);
  //       // clientCommands.login(user, socket, db, gUsers);
  //     }
  //     else {
  //       socket.emit('failure', {
  //         failure: 'signUp',
  //         message: 'Username is already taken.'
  //       });
  //     }
  //  });
  // },
  //
  // logout: function (aData, socket, db, gUsers) {
  //   var
  //     returnData = {},
  //     userID = aData.userID,
  //     findWhere,
  //     setData;
  //
  //   if (userID && userID.toString() === socket.userID.toString()) {
  //     findWhere = {
  //       _id: ObjectId(userID)
  //     },
  //     setData = {loggedIn: false};
  //     // update "loggedIn" flag on user in DB
  //     db.collection('users').update(findWhere, {$set: setData}, function () {
  //       // set flag on user in global list
  //       gUsers[userID].loggedIn = false;
  //       // flag on socket to be logged out
  //       socket.loggedIn = false;
  //       returnData = {
  //         success: 'logout',
  //         message: 'user: ' + userID + ' has logged out',
  //         userID: userID,
  //         users: gUsers
  //       };
  //       console.log('logging out success');
  //       // tell everyone ELSE a user has logged out
  //       socket.broadcast.emit('success', returnData);
  //       // tell user he has successfully logged out
  //       socket.emit('success', returnData);
  //     });
  //   }
  //   else {
  //     console.log('logging out failure');
  //     returnData = {
  //       failure: 'logout',
  //       message: 'failed to log out',
  //       userID: userID
  //     };
  //     socket.emit('failure', returnData);
  //   }
  // },
  //
  // login: function (aData, socket, db, gUsers) {
  //   var
  //     user = aData,
  //     returnData = {},
  //     loggedInUser,
  //     findWhere,
  //     setData = {loggedIn: true};
  //
  //   findWhere = aData._id !== undefined ? {
  //     "_id": ObjectId(aData._id)
  //   } : {
  //     password: md5(user.password),
  //     email: user.username
  //   };
  //   // db.collection(__l + ': users').findOne(findWhere, function (err, loggedInUser) {
  //   db.collection('users').findAndModify(
  //     findWhere, // query
  //     [],  // sort order
  //     {$set: setData}, // replacement, replaces only the field "hi"
  //     {}
  //   ).then(function (loggedInUser) {
  //     var user = loggedInUser.value, findWhere;
  //     // we have the user
  //     if (user) {
  //       findWhere = {_id: user._id};
  //       setData = {loggedIn: true};
  //       // update user in db to be "loggedIn"
  //       db.collection('users').update(findWhere, {$set: setData}, function () {
  //         console.log(__l + ': Welcome back ' + user.username);
  //         // set the user id on the socket
  //         socket.userID = user._id;
  //         // set the loggedIn flag on the users socket
  //         socket.loggedIn = true;
  //
  //         // set socket id on user
  //         user.socketID = socket.id;
  //         //set the loggedIn flag on the user
  //         user.loggedIn = true;
  //
  //         gUsers[user._id] = user;
  //
  //         socket.emit('success', {
  //           success: 'login',
  //           user: user,
  //           isUser: true,
  //           users: gUsers,
  //           message: 'Welcome back: ' + user.username
  //         });
  //
  //         socket.broadcast.emit('success', {
  //           success: 'login',
  //           isUser: false,
  //           user: user,
  //           users: gUsers,
  //           message: 'Welcome back: ' + user.username
  //         });
  //       });
  //     }
  //     else {
  //
  //       console.log(__l + ': login failure');
  //
  //       socket.emit('failure', {
  //         failure: 'login',
  //         user: user,
  //         message: 'no user with those details exist'
  //       });
  //     }
  //   });
  // }
// };
