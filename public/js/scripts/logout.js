define([
  'namespace',
  'jscookie',
  'handlebars'
],

function (namespace, Cookies, handlebars) {

  'use strict';

  var
    globals = namespace.globals,
    gUser = globals.gUser,
    gUsers = globals.gUsers,
    socket = globals.socket;

  // add success and failure to the global command list for callbacks
  globals.logout = {
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
        // get ID of user logging out
        userLoggingOutID = aData.userID,
        // get ID of current user
        userID = gUser._id,
        // get userlist element of the user logging out
        $user = $('.user-item[user-id="' + userLoggingOutID + '"]');



      // check of user loggin out is the current user
      if (userID === userLoggingOutID) {
        // console.log('its ->>ME<<- loggin out', this.gUser);

        // set flag on this user as they are the ones logging out
        gUser.loggedIn = false;

        Cookies.remove('appUser');
        // render the 'login module'
        // $('.user-list').html('ddddddd');
        globals.login.render();
      }
      else {
        // set flag on user who is logging out  in global users
        gUsers[aData.userID].loggedIn = false;
        // console.log('its ->>NOT<<- me logging out', this.gUser);
        $user.effect('pulsate', {times: 1}, 500);
        globals.getUsers.main({});
      }
    },
    failure: function (aData) {
      globals.showAlert('warning', aData.message);
    },
    render: function () {

    }
  };
});
