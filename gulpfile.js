var gulp = require('gulp');

var jasmine = require('gulp-jasmine');

var jscs = require('gulp-jscs');
var jscsStylish = require('gulp-jscs-stylish');

var jshint = require('gulp-jshint');
var jshintStylish = require('jshint-stylish');

var paths = [
  './gulpfile.js',
  './harmony.js',
  './src/**/*.js'
];

gulp.task('jasmine', function () {
  var tests = [
    './spec/**/*.js',
    '!./spec/conf.js'
  ];

  return gulp.src(tests, { read: false })
    .pipe(jasmine())
    .on('error', function (e) {
      throw e;
    });
});

gulp.task('standards', function () {
  return gulp.src(paths)
    .pipe(jshint())
    .pipe(jscs())
    .on('error', function () {
      // Suppress jscs errors, they're rolled into the jshint reporter, below.
    })
    .pipe(jscsStylish.combineWithHintResults())
    .pipe(jshint.reporter(jshintStylish))
    .pipe(jshint.reporter('fail'));
});

gulp.task('default', ['test']);
gulp.task('test', ['standards', 'jasmine']);
