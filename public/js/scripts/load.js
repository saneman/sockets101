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
  var
    globals = namespace.globals,
    // set up socket things on window thing
    socket = io();

  globals.socket = socket;

  // socket = globals.socket;

  // when socket recieves a 'connected' event start doing things
  socket.on('connected', function (aData) {
    // load templates recieved from server into the global templates variable
    globals.loadTemplates(aData.templates);

    // listen for server emitting 'success' event
    socket.on('success', function (aData) {
      // console.log("socket.on('success')", aData);
      // check if global method is availible
      if (globals[aData.success]) {
        globals[aData.success].success(aData);
      }
    });

    // listen for server emitting 'failure' event
    socket.on('failure', function (aData) {
      // console.log('failure :' + aData.failure);
      if (globals[aData.failure]) {
        globals[aData.failure].failure(aData);
      }
      else {
        globals.showAlert('warning', aData.message);
      }
    });

    // load the 'login module'
    require(['login'], function () {
      globals.login.render();
    });
  });
});
