define([
  'namespace',
  'jscookie',
  'handlebars',
  'bootstrap'
],

function (namespace, Cookies, handlebars) {

  'use strict';

  var
    utils = namespace.utils,
    showAlert = utils.showAlert,
    globals = namespace.globals,
    appUser = Cookies.getJSON('appUser'),
    template = handlebars.compile(gTemplates.login)(),
    commands = globals.commands,
    socket = globals.socket;

  console.log('loading login !!!!!');

  commands.signUp = {
    main: function () {
      socket.emit('command', {
        command: 'signUp',
        data: {
          username: $('.username').val(),
          password: $('.password').val()
        }
      });
    },
    success: function (aData) {
      commands.login.main();
      // clear global commands
      // commands.login = {};
    },
    failure: function (aData) {
      showAlert('warning', aData.message);
    }
  };


  // add success and failure to the global command loist for callbacks
  commands.login = {
    // main action of the module
    main: function (aData) {
      socket.emit('command', {
        command: 'login',
        data: {
          username: $('.username').val(),
          password: $('.password').val()
        }
      });
    },
    success: function (aData) {
      var
        user = aData.user,
        inFifteenMinutes = new Date(new Date().getTime() + 15 * 60 * 1000);

      // set global user
      globals.gUser = user;
      showAlert('success', 'Welcome back: ' + user.username);
      $('.login').remove();

      Cookies.set('appUser', {_id: user._id}, {expires: inFifteenMinutes});

      // load an app
      require(['buttons-app'], function () {
        commands.buttonsApp.render();
      });
      // load user list
      require(['user-list'], function () {
        commands.getUsers.render();
      });

      // clear global commands
      // commands.login = {};
    },
    failure: function (aData) {
      // console.log('login failure: ', aData);
      showAlert('warning', aData.message);
    },
    render: function () {
      showAlert('warning', 'render login');
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
      else {
        console.log('login render wtf ');
        // setTimeout(function () {
          $('.user-list').html('');
        // }, 0);
        // insert handlebars template in to app container
        $('.main').html(template);
        // listen for the click even on the "login button" and run "main"
        $('.login-button').off().on('click', commands.login.main);
        // listen for a click event on the "sign up button"
        $('.sign-up-button').off().on('click', commands.signUp.main);
      }
    }
  };
});
