define([
  'namespace',
  'io',
  'jscookie',
  'bootstrap',
  'jqueryui',
  'bootstrapslider',
],

function (namespace, io, Cookies) {

  'use strict';

  var utils = namespace.utils;

  console.log('namespace', namespace);

  var socket = io();
  socket.on('connected', function (aData) {
    // console.log('connected', aData);
    var appUser = Cookies.getJSON('appUser');
    namespace.gUsers = {};
    utils.loadTemplates(aData.templates, namespace.gTemplates);

    if (appUser !== undefined) {
      // console.log('cookie userSocket: ', appUser);
      // commands.login.main(appUser);
    }
    else {
      utils.loadLogin(aData);
    }
  });

  // $('body').fadeOut('slow');
  $('#slider').slider();

  var mea = true;

  if (!_.isUndefined(mea)) {
    console.log('Underscore works!');
  }
});
