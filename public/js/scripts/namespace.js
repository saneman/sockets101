define([
  'handlebars'
],

(function () {

  'use strict';

  // return headless function # constructor
  return function (Handlebars) {

    // return object
    return {
      globals: {
        gTemplates: {},
        gAlertCnt: 1,
        gAlertTime: 4000,
        gUsers: {},
        gUser: {},
        commands: {}
      },
      commands: {
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
              $user = $('.user-item[user-id="' + aData.data.userID + '"]'),
              flip = $button.hasClass('btn-primary');

            $button.toggleClass('btn-primary', !flip).toggleClass('btn-danger', flip);
            $user.effect('pulsate', {times: 1}, 500);
          },
          failure: function (aData) {
            console.log('padClick failure');
            // showAlert('warning', aData.message);
          }
        },

        takeControl: {
          main: function (aElement) {
            var padNum = $(aElement.target).attr('num');
            console.log('takeControl', gUser._id);
            socket.emit('command', {
              command: 'takeControl',
              data: {
                padNum: padNum,
                userID: gUser._id
              }
            });
          },
          success: function (aData) {

            console.log('takeControl success aData: ', aData);

            var
              template = Handlebars.compile(gTemplates.glyph),
              html = template({
                glyph: 'knight'
              }),
              $button = $('button[num="' + aData.data.padNum + '"]'),
              $user = $('.user-item[user-id="' + aData.data.userID + '"]');

            $button.html(html);

            if (aData.notMe) {
              $button.addClass('under-their-control');
              $button.off();
              $button.css('color','red');
            }
            else {
              $button.addClass('under-my-control');
              $('body').on('keydown', function (key) {
                if ([37, 38, 39, 40].indexOf(key.which) > -1) {
                  commands.moveButton.main(key.which);
                }
              });
              $button.css('color','lightgreen');
              $('.pad-button').off();
            }
          },
          failure: function (aData) {
            console.log('takeControl failure');
            // showAlert('warning', aData.message);
          }
        },
        moveButton: {
          main: function (aKeyNum) {
            socket.emit('command', {
              command: 'moveButton',
              data: {
                keyNum: aKeyNum,
                userID: gUser._id
              }
            });
          },
          success: function (aData) {
            var
              $button = !aData.notMe ? $('.under-my-control') : $('.under-their-control'),
              $user = $('.user-item[user-id="' + aData.data.userID + '"]'),
              direction = aData.direction,
              top = $button.position().top,
              left = $button.position().left,
              inc = 15,
              hit;

            switch (direction) {
              case 'forward':
                $button.css('top',  '-=' + ((top - inc) >= inc ? inc : (top - inc)) + 'px');
                break;
              case 'back':
                $button.css('top',  '+=' + inc + 'px');
                break;
              case 'left':
                $button.css('left',  '-=' + ((left - inc) >= inc ? inc : (left - inc)) + 'px');
                break;
              case 'right':
                $button.css('left',  '+=' + inc + 'px');
                break;
            }

            hit = $('.under-their-control').length !== 0 ?
              collision($('.under-my-control'), $('.under-their-control')) : false;

            if (hit) {
              console.log('you got him!!!!!');
            }

            $button.css('position', 'relative');
            $user.stop().effect('pulsate', {times: 1}, 50);
          },
          failure: function (aData) {
            console.log('moveButton failure');
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
              $user = $('.user-item[user-id="' + aData.userID + '"]');

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
      },

      utils: {
        loadTemplates: function (aTemplates) {
          var tKey;
          for (tKey in aTemplates) {
            gTemplates[tKey] = aTemplates[tKey];
          }
        },
        showAlert: function (aType, aMessage) {
          var
            template = Handlebars.compile(gTemplates.alert),
            alertID = 'alert' + gAlertCnt,
            current = $('.main-alert'),
            html = template({
              id: alertID,
              class: aType,
              message: aMessage,
              top: current.length ? ($('.main-alert')[0].attributes[1] + 10) : 0
            });
          $('.alert-box').append(html);
          $('#' + alertID).fadeOut(gAlertTime, 'swing', function () {
            $(this).remove();
          });
          gAlertCnt++;
        }
      }
    };
  };
})());
