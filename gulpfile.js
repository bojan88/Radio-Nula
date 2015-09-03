var gulp = require('gulp'),
    browserify = require('browserify'),
    babelify = require('babelify'),
    watchify = require('watchify'),
    gutil = require('gulp-util'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    sourcemaps = require('gulp-sourcemaps'),
    connect = require('gulp-connect'),
    del = require('del'),
    uglify = require('gulp-uglify'),
    replace = require('gulp-replace'),
    fs = require('fs');

watchify.args.debug = true;

var b = watchify(browserify('./app/main.jsx', watchify.args));

var production = false;

gulp.task('setProduction', function() {
  production = true;
});

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

gulp.task('clean:js', function(cb) {
  return del(['./dist/js/**/*'], cb);
});

gulp.task('clean:static', function(cb) {
  return del([
    './dist/background/**/*',
    './dist/*.html',
    './dist/manifest.json',
    './dist/style.css',
    './dist/images/**/*'
  ], cb);
});

gulp.task('copy', ['clean:static'], function() {
  gulp.src(['./app/background/**/*']).pipe(gulp.dest('./dist/background/'));
  gulp.src(['./app/images/**/*']).pipe(gulp.dest('./dist/images/'));

  var data = JSON.parse(fs.readFileSync('./app/sensitiveData.json', 'utf8'));

  return gulp.src([
    './app/*.html',
    './app/manifest.json',
    './app/style.css'
  ])
    .pipe(replace('{{oauthClientId}}', production ? data.oauth.prodClientId : data.oauth.devClientId))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('webserver', ['clean:js', 'copy', 'js', 'watch'], function() {
  connect.server({
    root: 'dist',
    livereload: false
  });
});

gulp.task('watch', function() {
  gulp.watch(['./app/**/*.html', './app/**/*.json', './app/**/*.css', './app/background/**/*'], ['copy']);
});


gulp.task('prod', ['clean:js', 'setProduction' , 'copy'], function() {
  return browserify('./app/main.jsx')
    .transform(babelify)
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('./dist/js'));
});


gulp.task('default', ['webserver']);
