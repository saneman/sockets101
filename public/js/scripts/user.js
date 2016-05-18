define([], function () {
  'use strict';
  return function () {
    var mArgs = arguments[0];
    console.log('mArgs', mArgs);
    $('body').html('i am the user module');
  };
});
