define([
  'namespace',
  'io',
  'jscookie'
],

function (namespace, io, Cookies) {

  'use strict';
  // set up socket things on window thing
  window.socket = io();
  // when socket recieves a 'connected' event start doing things
  socket.on('connected', function (aData) {
    var appUser = Cookies.getJSON('appUser');

    // load templates recieved from server into the global templates variable
    namespace.utils.loadTemplates(aData.templates);

    // load the login thing
    require(['login']);
  });
});
