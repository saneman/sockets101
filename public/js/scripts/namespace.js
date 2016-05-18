define([
],

(function () {

  'use strict';

  // return headless function # constructor
  return function () {

    // return object
    return {
      gUsers : {},

      gTemplates : {},

      utils : {
        loadTemplates : function (aTemplates, aGTemplates) {
          var tKey;
          for (tKey in aTemplates) {
            aGTemplates[tKey] = aTemplates[tKey];
          }
        },

        loadLogin : function (aData) {
          var loginTemplate = aData.templates.login;
          $('.app').html(loginTemplate);
          $('.login-button').off().on('click', function () {
            console.log('Login.');
          });
          $('.sign-up-button').off().on('click', function () {
            console.log('Sign up.');
          });
        }
      }
    };
  };
})());
