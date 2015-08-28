var gulp = require('gulp'),
    browserify = require('browserify'),
    babelify = require('babelify'),
    watchify = require('watchify'),
    gutil = require('gulp-util'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    sourcemaps = require('gulp-sourcemaps'),
    connect = require('gulp-connect'),
    del = require('del');

console.log(watchify.args);
watchify.args.debug = true;

var b = watchify(browserify('./app/main.jsx', watchify.args));

b.transform(babelify)

function bundle() {
  return b.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/js'));
}

b.on('update', bundle);
b.on('log', gutil.log);

gulp.task('js', bundle);

gulp.task('clean', function() {
  return del(['./dist']);
});

gulp.task('copy', function() {
  gulp.src(['./app/background/**/*']).pipe(gulp.dest('./dist/background/'));

  return gulp.src([
    './app/*.html',
    './app/manifest.json',
    './app/style.css'
  ]).pipe(gulp.dest('./dist/'));
});

gulp.task('webserver', ['clean', 'copy', 'js', 'watch'], function() {
  connect.server({
    root: 'dist',
    livereload: false
  });
});

gulp.task('watch', function() {
  gulp.watch(['./app/**/*.html', './app/**/*.json', './app/**/*.css', './app/background/**/*'], ['copy']);
})


gulp.task('default', ['webserver']);
