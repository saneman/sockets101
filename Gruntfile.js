// Game Engine Gruntfile
module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg : grunt.file.readJSON('package.json'),
    jshint : {
      js : ['public/js/main.js'],
    },
    less: {
      development: {
        files: {
          'public/css/main.css' : 'public/less/main.less'
        }
      }
    },
    watch : {
      js : {
        files: ['public/js/main.js'],
        tasks: ['jshint']
      },
      css : {
        files : ['public/**/*.less'],
        tasks : ['less']
      }
    }
  });

  // Load the plugin that provides the "watch" task.
  grunt.loadNpmTasks('grunt-contrib-watch');
  // Load the plugin that provides the "jshint" task.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  // Load the plugin that provides the "less" task.
  grunt.loadNpmTasks('grunt-contrib-less');

  // Default task(s).
  grunt.registerTask('default', ['less', 'watch']);
};
