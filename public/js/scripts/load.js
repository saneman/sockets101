// define what libs we need
define([
  'namespace',
  'io',
  'jscookie'
],

// callback method
function (namespace, io, Cookies) {

  "use strict";

  // get globals from the namespace
  var globals = namespace.globals;

  // set up socket things on window thing
  globals.socket = io();

  // when socket recieves a 'connected' event start doing things
  globals.socket.on('connected', function (aData) {
    // load templates recieved from server into the global templates variable
    namespace.utils.loadTemplates(aData.templates);

    // listen for server emitting 'success' event
    globals.socket.on('success', function (aData) {
      globals.commands[aData.success].success(aData);
    });

    // listen for server emitting 'success' event
    globals.socket.on('failure', function (aData) {
      globals.commands[aData.failure].failure(aData);
    });

    // load the 'login module'
    require(['login'], function () {
      globals.commands.login.render();
    });
  });
});
