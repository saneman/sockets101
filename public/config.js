// config for require
require.config({
    baseUrl: 'js/',
    paths: {
      app: '.',
      jquery: 'libs/jquery-2.2.0.min',
      io: 'libs/socket.io'
    },
    shim: {
      'config': {
        deps: ['jquery'],
        exports: 'config'
      }
    }
});
