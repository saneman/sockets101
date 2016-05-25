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

  // add success and failure to the global command loist for callbacks
  globals.login = {
    // main action of the module
    main: function (aData) {
      socket.emit('command', {
        command: 'login',
        data: aData._id !== undefined ? {
          _id: aData._id
        } : {
          username: $('.username').val(),
          password: $('.password').val()
        }
      });
    },
    success: function (aData) {
      var
        isUser = aData.isUser,
        user = aData.user,
        users = aData.users,
        message = aData.message,
        inFifteenMinutes = new Date(new Date().getTime() + 15 * 60 * 1000),
        appUser = Cookies.getJSON('appUser');

      if (isUser) {
        globals.gUser = user;

        globals.showAlert('success', message);
        $('.login').remove();

        Cookies.set('appUser', {_id: user._id}, {expires: inFifteenMinutes});

        // load an app
        require(['buttons-app'], function () {
          globals.buttonsApp.render();
        });
        // load user list
        require(['user-list'], function () {
          globals.getUsers.render();
        });
      }
    },
    failure: function (aData) {
      var appUser = Cookies.getJSON('appUser');
      if (appUser !== undefined) {
        Cookies.remove('appUser');
        appUser = undefined;
        globals.login.render();
      }
      // console.log('login failure: ', aData);
      globals.showAlert('warning', aData.message);
    },
    render: function () {
      var appUser = Cookies.getJSON('appUser');
      // globals.showAlert('warning', 'render login');
      // console.log('warning', 'render login', appUser);
      if (appUser !== undefined) {
        // run login command
        this.main({
          _id: appUser._id
        });
      }
      else {
        $('.user-list').html('').hide();
        // insert handlebars template in to app container
        $('.main').html(template);
        // listen for the click even on the "login button" and run "main"
        $('.login-button').off().on('click', globals.login.main);
        // listen for a click event on the "sign up button"
        require(['signup'], function () {
          globals.signup.render();
        });
      }
    }
  };
});
