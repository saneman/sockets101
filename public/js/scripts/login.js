define([
  'js/scripts/user.js',
  'js/scripts/app2.js'
],

function (user, app) {
  'use strict';

  var newUser = new user({
    hello : 'Hello user.'
  });


  if (1 === 1) {
    var ppa = new app({apples: 'granny smith'});

    ppa.main();

    console.log('ppa', ppa);
  }
});
