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
    appUser = Cookies.getJSON('appUser'),
    template = handlebars.compile(gTemplates.login)(),
    main = function (aData) {
      var
        data = aData !== undefined && aData._id !== undefined ?
          {
            _id: aData._id
          } : {
            username: $('.username').val(),
            password: $('.password').val()
          };

      socket.emit('command', {
        command: 'login',
        data: data
      });
    },
    success = function (aData) {
      utils.showAlert('success', 'Welcome back: ' + aData.user.username);

      $('.login').remove();

      gUser = aData.user;

      // set cookie data of user
      var inFifteenMinutes = new Date(new Date().getTime() + 15 * 60 * 1000);
      // var inHalfAMinute = new Date(new Date().getTime() + 1 * 30 * 1000);
      Cookies.set('appUser',
        {
          _id: aData.user._id
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
      // loadApp('buttons-app');

    },
    failure = function (aData) {
      // console.log('login failure: ', aData);
      utils.showAlert('warning', aData.message);
    };

    if (appUser !== undefined) {
      // console.log('cookie userSocket: ', appUser, 'loading login + auto login');
      // run login command
      socket.emit('command', {
        command: 'login',
        data: {
          _id: appUser._id
        }
      });
    }

  // listen for server emitting 'success' event
  socket.on('success', function (aData) {
    success(aData);
  });
  // listen for server emitting 'success' event
  socket.on('failure', function (aData) {
    failure(aData);
  });

  $('.app').html(template);

  $('.login-button').off().on('click', main);

  $('.sign-up-button').off().on('click', function () {
    console.log('Sign up.');
  });

});
