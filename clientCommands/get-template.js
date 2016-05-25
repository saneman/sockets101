module.exports = function (aData, socket, db, gUsers) {
  var dir = __dirname + '/../templates/';
  getTemplateList(function (aList) {
    var templateCount = aList.length;
    for (var fKey in aList) {
      fs.readFile(dir + aList[fKey], 'utf8',
        (function(filename, err, data) {
          console.log('filename', filename);
          var
            returnData = {
              success: 'getTemplate',
              templateName: filename.split('.tmpl')[0],
              template: data,
              templateCount: templateCount
            };
          socket.emit('success', returnData);
        }).bind(null, aList[fKey])
      );
    }
  });
};
