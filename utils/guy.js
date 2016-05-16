module.exports = {
  md5: require('md5'),
  prepUser: function (aUser, aSocket) {
    var user = {
      email: aUser.username,
      username: aUser.username.split('@')[0],
      password: this.md5(aUser.password),
      socketID: aSocket.id
    };
    return user;
  },
  v: function () {
    var a = 'AAA';
    return a;
  }
};
