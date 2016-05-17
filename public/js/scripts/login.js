define(function (require) {
  'use strict';

  var user = require('js/scripts/user.js');
  new user({
    hello : 'Hello user.'
  });


  if (1 === 1) {
    var app = require('js/scripts/app2.js');

    var ppa = new app({apples: 'granny smith'});

    ppa.main();

    console.log('ppa', ppa);
  }
});
