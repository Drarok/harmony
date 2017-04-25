const gulp = require('gulp');

const jasmine = require('gulp-jasmine');
const eslint = require('gulp-eslint');

gulp.task('jasmine', () => {
  let tests = [
    './spec/**/*.spec.js'
  ];

  return gulp.src(tests)
    .pipe(jasmine())
    .on('error', function (e) {
      throw e;
    });
});

let paths = [
  './gulpfile.js',
  './harmony.js',
  './spec/**/*.js',
  './src/**/*.js'
];

gulp.task('standards', () => {
  return gulp.src(paths)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('watch', ['test'], function () {
  return gulp.watch(paths, ['test']);
});

gulp.task('default', ['test']);
gulp.task('test', ['standards', 'jasmine']);
