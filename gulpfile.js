var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var minifyCss = require('gulp-minify-css');

const PATH = 'public/'; // Setting up our front-end root path

gulp.task('js', function() {

  gulp.src([
      './bower_components/jquery/dist/jquery.min.js',
      './bower_components/angular/angular.min.js',
      './bower_components/angular-route/angular-route.min.js',
      './bower_components/bootstrap/dist/js/bootstrap.min.js'
    ])
    .pipe(concat('3rd-party.js'))
    .pipe(uglify())
    .pipe(gulp.dest(PATH + 'js'))

});

gulp.task('css', function() {

  gulp.src([
    './bower_components/**/*.css',
  ])
    .pipe(concat('3rd-party.css'))
    .pipe(minifyCss())
    .pipe(gulp.dest(PATH + 'css'));

  gulp.src('./bower_components/bootstrap/fonts/*.*') // Import Bootstrap Glyphicons
    .pipe(gulp.dest(PATH + 'fonts'));
});

gulp.task('default', ['js', 'css']);
