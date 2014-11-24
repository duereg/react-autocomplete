var gulp      = require("gulp");

var react = require('gulp-react');
var clean = require('gulp-clean');

gulp.task('clean', function() {
    return gulp.src(['lib'], {read: false}).pipe(clean());
});


gulp.task('compile-jsx', ['clean'], function () {

    return gulp.src('./src/**')
        .pipe(react({harmony : true}))
        .pipe(gulp.dest('./lib'));
});
