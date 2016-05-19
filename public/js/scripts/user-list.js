define([
  'namespace',
  'handlebars'
],

function (namespace, handlebars) {

  'use strict';

  var
    utils = namespace.utils,
    main = function (aUserSearch) {
      socket.emit('command', {
        command: 'getUsers',
        data: aUserSearch
      });
    },
    success = function (aData) {


      console.log('gUser', gUser);


      var
        user = aData.user,
        isUser = user._id === gUser._id,
        template = handlebars.compile(gTemplates['user-list']);


      user.active = isUser ? 'active' : undefined;
      gUsers[user._id] = user;


      console.log('user', user);

      $('.user-list').html(template({users: gUsers}));
      $('.logout-button').off().on('click', function () {
        console.log('lougout!');
      });

    },
    failure = function (aData) {
      console.log('user-list failure');
      showAlert('warning', aData.message);
    };

  // listen for server emitting 'success' event
  socket.on('success', function (aData) {
    success(aData);
  });
  // listen for server emitting 'success' event
  socket.on('failure', function (aData) {
    failure(aData);
  });

  main();
});
