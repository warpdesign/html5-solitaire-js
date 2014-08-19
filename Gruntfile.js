/*globals module*/
module.exports = function(grunt) {
    /*jslint devel: true*/
    "use strict";

    // custom small grunt tasks
    var gruntTasks = require('./build/gruntTasks');

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        copy: {
            main: {
                files: [
                    // assets
                    {expand: true, src: ['gods/audio/**', 'gods/img/**'], dest: 'dist/'},
                    // libs
                    {expand: true, src: ['js/lib/**'], dest: 'dist/'},
                    // js assets
                    {expand: true, src: ['gods/js/sprites/**', 'gods/js/sprites/**'], dest: 'dist/'},
                    // hard-coded: FIXME!
                    {expand: true, src: ['gods/js/maps/**'], dest: 'dist'},
                    // css
                    {expand: true, src: ['gods/css/**'], dest: 'dist'},
                    // binary stuff
                    {expand: true, src: ['gods/data/**'], dest: 'dist'},
                    // binary stuff
                    {expand: true, src: ['mapEditor.html'], dest: 'dist'}
                ]
            }
        },
        karma: {
          unit: {
            configFile: 'conf/karma.conf.js'
          }
      },
        connect: {
            options: {
                port: 8000,
                hostname: '*',
                keepalive: true
            },
            dev: {

            },
            prod: {
                options: {
                    base: 'dist',
                    open: 'http://127.0.0.1:8000/index.html?hide=true'
                }
            }
        },
        clean: {
            options: {
                files: ['dist']
            },
            build: {
                options: {
                    files: ['dist']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-karma');

    grunt.registerTask('build', ['clean:build', 'copy']);
    grunt.registerTask('test', ['karma']);
    grunt.registerTask('default', ['connect:dev']);

    grunt.registerMultiTask('clean', 'cleans specified directory', gruntTasks.clean);
    grunt.registerMultiTask('file-creator', 'cleans specified directory', gruntTasks.createFiles);
};
