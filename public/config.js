// config for require
require.config({
  baseUrl: 'js/scripts',
  paths: {
    public: '.',
    jquery: '../libs/jquery',
    jqueryui: '../libs/jquery-ui',
    io: '../libs/socket.io',
    handlebars: '../libs/handlebars',
    underscore: '../libs/underscore',
    jscookie: '../libs/js.cookie',
    bootstrap: '../libs/bootstrap',
    bootstrapslider: '../libs/bootstrap-slider'
  },
  shim: {
    'config': {
      deps: ['underscore', 'jquery'],
      exports: 'config'
    },
    'bootstrap': {
      deps: ['jquery']
    },
    'jqueryui': {
      deps: ['jquery']
    },
    'bootstrapslider': {
      deps: ['bootstrap']
    },
    'jscookie': {
      deps: ['jquery']
    }
  }
});

// global variable
var
  gTemplates = {},
  gAlertCnt = 1,
  gAlertTime = 4000,
  gUsers = {},
  gUser = {};

// load app... duh
require(['load']);
