define([
  'namespace',
  'jscookie',
  'handlebars'
],

function (namespace, Cookies, handlebars) {

  'use strict';

  var
    utils = namespace.utils,
    showAlert = utils.showAlert,
    globals = namespace.globals,
    commands = globals.commands,
    socket = globals.socket;

  // add success and failure to the global command list for callbacks
  commands.getUsers = {
    main: function (aUserSearch) {
      socket.emit('command', {
        command: 'getUsers',
        data: aUserSearch
      });
    },
    success: function (aData) {
      var
        user = aData.user,
        isUser = user._id === globals.gUser._id,
        template = handlebars.compile(gTemplates['user-list']);

      user.active = isUser ? 'active' : undefined;
      globals.gUsers[user._id] = user;

      // if (user.loggedIn) {
        $('.user-list').html(template({users: globals.gUsers}));

        console.log('user-list success: ' + isUser, globals.gUser);

        $('.logout-button').off().on('click', function () {
          // load the 'login module'
          require(['logout'], function () {
            globals.commands.logout.main();
          });
        });
      // }
    },
    failure: function (aData) {
      showAlert('warning', aData.message);
    },
    render: function () {
      console.log('user-list render');
      commands.getUsers.main();
    }
  };










});
