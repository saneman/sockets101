define([
  'namespace',
  'io',
  'jscookie'
],

function (namespace, io, Cookies) {

  'use strict';

  var globals = namespace.globals;

  // set up socket things on window thing
  globals.socket = io();
  // when socket recieves a 'connected' event start doing things
  globals.socket.on('connected', function (aData) {

    // load templates recieved from server into the global templates variable
    namespace.utils.loadTemplates(aData.templates);

    // listen for server emitting 'success' event
    globals.socket.on('success', function (aData) {
      var
        command = aData.success;
      globals.commands[command].success(aData);
    });
    // listen for server emitting 'success' event
    globals.socket.on('failure', function (aData) {
      var
        command = aData.failure;
      globals.commands[command].failure(aData);
    });

    // load the login thing
    require(['login']);
  });
});
