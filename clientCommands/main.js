var
  signup = require('./signup'),
  login = require('./login'),
  getUsers = require('./get-users'),
  moveButton = require('./move-button'),
  takeControl = require('./take-control'),
  padClick = require('./pad-click'),
  getTemplate = require('./get-template');
module.exports = {
  signup: signup,
  login: login,
  getUsers: getUsers,
  moveButton: moveButton,
  takeControl: takeControl,
  padClick: padClick,
  getTemplate: getTemplate
};
