define([
  'namespace',
  'jscookie',
  'handlebars',
  'bootstrap'
],

function (namespace, Cookies, handlebars) {

  "use strict";

  var
    globals = namespace.globals,
    gTemplates = globals.gTemplates,
    template = handlebars.compile(gTemplates.login)(),
    socket = globals.socket;

  globals.signup = {
    main: function () {
      socket.emit('command', {
        command: 'signup',
        data: {
          username: $('.username').val(),
          password: $('.password').val()
        }
      });
    },
    success: function (aData) {
      var
        user = aData.user;
        // gUsers = globals.gUsers;

      // gUsers[user._id] = user;
      // console.log('signup success user: ', user);
      globals.login.main(user);
    },
    failure: function (aData) {
      console.log('sign up failure');
      globals.showAlert('warning', aData.message);
    },

    render: function () {
      // console.log('rendering signup:');
      $('.sign-up-button').off().on('click', globals.signup.main);
    }
  };
});
