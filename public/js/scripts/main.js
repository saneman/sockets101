"use strict";
$(function() {
  var
    connected = false,
    gAlertTime = 4000,
    gTemplates = {},
    // make a socket connection
    socket = io(),
    $loginButton,
    $signUpButton,
    alertCnt = 1,
    gUsers = {},
    gUser = {},
    $app = $('.app'),


    displayUsers = function (aUser) {
      var
        // user = aData.user,
        isUser = aUser._id === gUser._id,
        template = Handlebars.compile(gTemplates['user-list']),
        html;

      aUser.active = isUser ? 'active' : undefined;
      html = template({users: gUsers});
      $('.userList').html(html);
      $('.logoutButton').off().on('click', commands.logout.main);
    },

    loadLogin = function () {
      $app.html(gTemplates['login']);
      $('.loginButton').off().on('click', commands.login.main);
      $('.signUpButton').off().on('click', commands.signUp.main);
    },

    //old
    displayUsers_old = function (aUsers) {
      // console.log('displayUsers', displayUsers);
      var
        template = Handlebars.compile(gTemplates['userList']),
        html = (template(aUsers));
        $app.append(html);
        // $('.userList').html(html);
    },

    loadApp = function (aApp) {
      $app.html(gTemplates[aApp]);
      $('.padButton').off().on('click', commands.padClick.main);
      // load user list
      commands.getUsers.main();
    },

    loadTemplates = function (aTemplates) {
      var tKey;
      for (tKey in aTemplates) {
        gTemplates[tKey] = aTemplates[tKey];
      }
    },

    showAlert = function (aType, aMessage) {
      var
        template = Handlebars.compile(gTemplates['alert']),
        alertID = 'alert' + alertCnt,
        current = $('.mainAlert'),
        html = template({
          id: alertID,
          class: aType,
          message: aMessage,
          top: current.length
            ? ($('.mainAlert')[0].attributes[1] + 10) : 0
        });
      $('.alertBox').append(html);
      $('#' + alertID).fadeOut(gAlertTime, 'swing', function () {
        $(this).remove();
      });
      alertCnt++;
    },

    highLight = function (aElement, b) {
      // console.log('highLight', aElement, b)
      $(aElement.target).addClass('active');
    },

    commands = {
      padClick: {
        main: function (aElement) {
          var padNum = $(aElement.target).attr('num');
          socket.emit('command', {
            command: 'padClick',
            data: {
              padNum: padNum,
              userID: gUser._id
            }
          });
          console.log('padClick', $(aElement.target).attr('num'));
        },
        success: function (aData) {
          // showAlert('success', aData.message);
          var
            $button = $('button[num="' + aData.data.padNum + '"]'),
            $user = $('.userItem[userID="' + aData.data.userID + '"]'),
            flip = $button.hasClass('btn-primary');

          $button.toggleClass('btn-primary', !flip).toggleClass('btn-danger', flip);
          $user.effect('pulsate', {times: 1}, 500);
        },
        failure: function (aData) {
          console.log('padClick failure');
          // showAlert('warning', aData.message);
        }
      },

      getUsers: {
        main: function (aUserSearch) {
          socket.emit('command', {
            command: 'getUsers',
            data: aUserSearch
          });
        },
        success: function (aData) {
          var user = aData.user;
          gUsers[user._id] = user;
          displayUsers(user);
        },
        failure: function (aData) {
          showAlert('warning', aData.message);
        }
      },
      signUp: {
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
        },
        failure: function (aData) {
          showAlert('warning', aData.message);
        }
      },
      login: {
        main: function (aData) {
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
        success: function (aData) {
          showAlert('success', 'Welcome back: ' + aData.user.username);
          $('.login').remove();
          // $app.addClass('split');

          gUser = aData.user;

          // set cookie data of user
          // var inFifteenMinutes = new Date(new Date().getTime() + 15 * 60 * 1000);
          var inHalfAMinute = new Date(new Date().getTime() + 1 * 30 * 1000);
          Cookies.set('appUser',
            {
              _id: aData.user._id
            },
            // {expires: inFifteenMinutes}
            {expires: inHalfAMinute}
          );

          // load app
          loadApp('buttonsApp');
        },
        failure: function (aData) {
          // console.log('login failure: ', aData);
          showAlert('warning', aData.message);
        }
      },

      logout: {
        main: function (aElement) {
          socket.emit('command', {
            command: 'logout',
            data: {
              userID: gUser._id
            }
          });
        },
        success: function (aData) {
          var
            userLoggingOutID = aData.userID,
            userID = gUser._id,
            $user = $('.userItem[userID="' + aData.userID + '"]');

          console.log(aData.userID, gUser._id, gUsers);

          if (userID === userLoggingOutID) {
            console.log('im loggin out bye bye');
            delete gUsers[aData.userID];
            Cookies.remove('appUser');
            loadLogin();
          }
          else {
            console.log('someone has logged out');
            $user.effect('pulsate', {times: 1}, 500);
            commands.getUsers.main({});
          }
        },
        failure: function (aData) {
          // console.log('logout failure');
          showAlert('warning', aData.message);
        }
      },
    };

  //----------------------------------------------------------
  //--------------------| EVENTS START |----------------------
  //----------------------------------------------------------

  // listen for 'click' event on login button and execute login main

  // listen for server emitting 'failure' event
  socket.on('failure', function (aData) {
    // get failure command command
    var command = aData.failure;
    // run failure method of command
    commands[command].failure(aData);
  });

  // listen for server emitting 'success' event
  socket.on('success', function (aData) {
    // get command that was in success by the server
    var command = aData.success;
    //run success method of command
    commands[command].success(aData);
  });

  // listen for server emitting 'connected' event
  socket.on('connected', function (aData) {
    // console.log('connected', aData);

    var appUser = Cookies.getJSON('appUser');
    gUsers = {};
    loadTemplates(aData.templates);
    connected = true;

    if (appUser !== undefined) {
      // console.log('cookie userSocket: ', appUser);
      commands.login.main(appUser)
    }
    else {
      loadLogin();
    }
  });

  //----------------------------------------------------------
  //--------------------| EVENTS END |------------------------
  //----------------------------------------------------------

});