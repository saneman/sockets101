define([
  'namespace',
  'jscookie',
  'handlebars',
  'bootstrap',
  'jqueryui',
  'bootstrapslider'
],

function (namespace, Cookies, handlebars) {

  'use strict';

  var
    utils = namespace.utils,
    globals = namespace.globals,
    appUser = Cookies.getJSON('appUser'),
    template = handlebars.compile(gTemplates.login)(),

    main = function (aData) {
      globals.socket.emit('command', {
        command: 'login',
        data: {
          username: $('.username').val(),
          password: $('.password').val()
        }
      });
    };

    // add success and failure to the global command loist for callbacks
    globals.commands.login = {
      success: function (aData) {

        console.log('globals.commands', globals.commands);


        // console.log('aData', aData);


        var
          user = aData.user,
          inFifteenMinutes = new Date(new Date().getTime() + 15 * 60 * 1000);

        // set global user
        globals.gUser = user;

        // console.log('global user', globals.gUser);


        utils.showAlert('success', 'Welcome back: ' + user.username);

        $('.login').remove();

        // var inHalfAMinute = new Date(new Date().getTime() + 1 * 30 * 1000);
        Cookies.set('appUser',
          {
            _id: user._id
          },
          {
            expires: inFifteenMinutes
          }
          // {
          //   expires: inHalfAMinute
          // }
        );

        // load an app
        require(['buttons-app']);
        require(['user-list']);
        // clear global commands
        globals.commands.login = {};
      },
      failure: function (aData) {
        // console.log('login failure: ', aData);
        utils.showAlert('warning', aData.message);
      }
    };

    if (appUser !== undefined) {
      // console.log('cookie userSocket: ', appUser, 'loading login + auto login');
      // run login command
      globals.socket.emit('command', {
        command: 'login',
        data: {
          _id: appUser._id
        }
      });
    }

  $('.app').html(template);
  $('.login-button').off().on('click', main);
  $('.sign-up-button').off().on('click', function () {
    console.log('Sign up.');
  });

});
