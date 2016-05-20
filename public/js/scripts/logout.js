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
  commands.logout = {
    main: function (aElement) {
      socket.emit('command', {
        command: 'logout',
        data: {
          userID: globals.gUser._id
        }
      });
    },
    success: function (aData) {
      var
        userLoggingOutID = aData.userID,
        user = aData.user,
        userID = globals.gUser._id,
        $user = $('.user-item[user-id="' + aData.userID + '"]');

      console.log('logout success');

      if (userID === userLoggingOutID) {
        gUser = user;
        console.log('its me loggin out', gUser);
        delete gUsers[aData.userID];
        Cookies.remove('appUser');
        // render the 'login module'
        // $('.user-list').html('ddddddd');
        commands.login.render();
      }
      else {
        console.log('its not me loggin');
        $user.effect('pulsate', {times: 1}, 500);
        commands.getUsers.main({});
      }
    },
    failure: function (aData) {
      showAlert('warning', aData.message);
    },
    render: function () {

    }
  };
});
