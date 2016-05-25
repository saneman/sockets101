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
    socket = globals.socket;

  globals.getTemplate = {
    main: function (aData) {
      // send server the command "getTemplate"
      socket.emit('command', {
        command: 'getTemplate',
        data: {}
      });
    },
    success: function (aData) {
      var
        // name of template coming from server
        templateName = aData.templateName,
        // content of template coming from server
        template = aData.template,
        // count of templates that the server will be sending
        templateCount = aData.templateCount,
        gTemplateCount;
      // add the template to the "gTemplates"
      gTemplates[templateName] = template;
      // get the latest count of the templates loaded
      gTemplateCount = Object.keys(gTemplates).length;
      // if the counts match we have everything to run the app
      if (gTemplateCount === templateCount) {
        // start app by loading the "login" script
        require(['login'], function () {
          // when the "login" script is loaded run the render method of "login"
          globals.login.render();
        });
      }
    },
    failure: function (aData) {
    },
    render: function (aData) {
    }
  };
});
