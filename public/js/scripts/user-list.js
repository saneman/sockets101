define([
  'namespace',
  'handlebars'
],

function (namespace, handlebars) {

  'use strict';

  var
    utils = namespace.utils,
    globals = namespace.globals,
    main = function (aUserSearch) {
      globals.socket.emit('command', {
        command: 'getUsers',
        data: aUserSearch
      });
    };
    // add success and failure to the global command loist for callbacks
    globals.commands.getUsers = {
      success: function (aData) {
        var
          user = aData.user,
          isUser = user._id === globals.gUser._id,
          template = handlebars.compile(gTemplates['user-list']);

        user.active = isUser ? 'active' : undefined;
        globals.gUsers[user._id] = user;

        $('.user-list').html(template({users: globals.gUsers}));
        $('.logout-button').off().on('click', function () {
          console.log('logout!');
        });
      },
      failure: function (aData) {
        console.log('user-list failure');
        showAlert('warning', aData.message);
      }
    };
  main();
});
