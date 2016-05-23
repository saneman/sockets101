define([
  'namespace',
  'jscookie',
  'handlebars'
],

function (namespace, Cookies, handlebars) {

  "use strict";

  var
    globals = namespace.globals,
    gUser = globals.gUser,
    gUsers = globals.gUsers,
    gTemplates = globals.gTemplates,
    socket = globals.socket;

  // add success and failure to the global command list for callbacks
  globals.getUsers = {
    main: function (aUserSearch) {
      socket.emit('command', {
        command: 'getUsers',
        data: aUserSearch
      });
    },
    success: function (aData) {
      var
        user = aData.user,
        users = aData.users,
        gUser = globals.gUser,
        isUser = user._id === gUser._id,
        template = handlebars.compile(gTemplates['user-list']);

      user.active = isUser ? 'active' : undefined;
      // gUsers[socket.id] = user;

      gUsers = users;
      if (isUser) {
        gUsers[gUser._id].isUser = isUser;
      }
      gUsers[user._id].active = isUser ? 'active' : undefined;


      // console.log('gUsers: ', gUsers);

      // console.log('isUser: ' + user.username, isUser);

      console.log('GU gUser: ', gUser._id, ' vs ', user._id);
      console.log('GU gUsers: ', gUsers);

      // console.log('getUsers: ', user.socketID, globals.socket.id);
      // console.log('getUsers: gUser: ', gUser);

      // check if user is logged in and is user is active
      // if (gUser.loggedIn) {
        $('.user-list').html(template({users: gUsers})).show();

        // console.log('user-list success: ' + isUser, gUser);

        $('.logout-button').off().on('click', function () {
          // load the 'login module'
          require(['logout'], function () {
            globals.logout.main();
          });
        });

      // }

    },
    failure: function (aData) {
      globals.showAlert('warning', aData.message);
    },
    render: function () {
      // console.log('user-list render');
      globals.getUsers.main();
    }
  };










});
