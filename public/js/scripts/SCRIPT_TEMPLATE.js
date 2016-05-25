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

  globals.signup = {
    main: function (aData) {
    },
    success: function (aData) {
    },
    failure: function (aData) {
    },
    render: function (aData) {
    }
  };
});
