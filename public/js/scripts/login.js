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

  // globals.signUp = {
  //   main: function () {
  //     socket.emit('command', {
  //       command: 'signUp',
  //       data: {
  //         username: $('.username').val(),
  //         password: $('.password').val()
  //       }
  //     });
  //   },
  //   success: function (aData) {
  //     var
  //       user = aData.user,
  //       gUsers = globals.gUsers;
  //
  //     gUsers[user._id] = user;
  //     // console.log('signUp success user: ', user);
  //     globals.login.main(user);
  //   },
  //   failure: function (aData) {
  //     console.log('sign up failure');
  //     globals.showAlert('warning', aData.message);
  //   }
  // };


  // add success and failure to the global command loist for callbacks
  globals.login = {
    // main action of the module
    main: function (aData) {

      // console.log('login: main ' + aData._id, aData);

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
        // gUser = globals.gUser;

      // console.log('user: ', user);
      // console.log('users: ', users);

      // console.log('isUser', isUser, user);

      // globals.gUsers = users;


      // console.log('globals.gUsers', globals.gUsers);

      // set global user
      // if (appUser !== undefined &&
        // user._id.toString() === appUser._id.toString()) {
        // gUser = user;
      // }

      // console.log('gUser', gUser);

      // console.log(' vs cookie match: ',  user._id.toString() === appUser._id.toString());
      if (isUser) {

        globals.gUser = user;

        globals.showAlert('success', message);
        $('.login').remove();

        // Cookies.set('appUser', {_id: user._id}, {expires: inFifteenMinutes});

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
      globals.showAlert('warning', 'render login');
      // console.log('warning', 'render login', appUser);
      if (appUser !== undefined) {
        // console.log('cookie userSocket: ', appUser, 'loading login + auto login');
        // run login command

        this.main({
          _id: appUser._id
        });

        // socket.emit('command', {
        //   command: 'login',
        //   data: {
        //     _id: appUser._id
        //   }
        // });
      }
      else {
        $('.user-list').html('').hide();
        // insert handlebars template in to app container
        $('.main').html(template);
        // listen for the click even on the "login button" and run "main"
        $('.login-button').off().on('click', globals.login.main);
        // listen for a click event on the "sign up button"
        // $('.sign-up-button').off().on('click', globals.signUp.main);
        require(['signup'], function () {
          globals.signup.render();
        });
      }
    }
  };
});
