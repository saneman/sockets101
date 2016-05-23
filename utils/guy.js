var md5 = require('md5');
module.exports = {
  md5: md5,
  prepUser: function (aUser, aSocket) {
    var user = {
      email: aUser.username,
      username: aUser.username.split('@')[0],
      password: md5(aUser.password),
      socketID: aSocket.id,
      loggedIn: false
    };
    return user;
  },
  globalStack: Object.defineProperty(global, '__stack', {
    get: function(){
      var orig = Error.prepareStackTrace;
      Error.prepareStackTrace = function(_, stack){ return stack; };
      var err = new Error;
      Error.captureStackTrace(err, arguments.callee);
      var stack = err.stack;
      Error.prepareStackTrace = orig;
      return stack;
    }
  }),
  globalLine: Object.defineProperty(global, '__l', {
    get: function(){
      return __stack[1].getLineNumber();
    }
  })
};
