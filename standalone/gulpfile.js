var buildBundle = require('./gulp/util/bundleBuilder');
var gulp        = require('gulp');
var concat			= require('gulp-concat');
var uglify      = require('gulp-uglify');
var rename      = require('gulp-rename');
var less = require("gulp-less");

// task
gulp.task('styles', function () {
    return gulp.src('../themes/bootstrap.less')
    .pipe(gulp.dest('.'));
});


gulp.task('bundle', function() {
  var bundleConfig = {
    // Specify the entry point of your app
    entries: ['./index.js']

  };


  return buildBundle(bundleConfig, '../reactAutocomplete.js', '.', undefined, {excludes : ['react', 'react/addons']} );

});


gulp.task('default', ['bundle', 'styles'],  function() {

  gulp.src('../reactAutocomplete.js')
  .pipe(uglify())
  .pipe(rename('reactAutocomplete.min.js'))
  .pipe(gulp.dest('../'))
});
