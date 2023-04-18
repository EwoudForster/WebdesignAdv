const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const plumber = require('gulp-plumber');
const sass = require('gulp-dart-sass');
const prefix = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const mqpacker = require('@lipemat/css-mqpacker');
const notify = require('gulp-notify');
const newer = require('gulp-newer');
const cleanCSS = require('gulp-clean-css');
const ngrok = require('ngrok');

gulp.task('browser-sync', function () {
    browserSync.init({
        startPath: '/index.html',
        server: {
            baseDir: "./dist",
            directory: true
        },
        port: 3000
    }, async function (err, bs) {
        const tunnel = await ngrok.connect({
            port: bs.options.get('port'),
            region: 'eu'
        });
        console.log(' ------------------------------------------------');
        console.log(`  ngrok control panel: http://localhost:4040`);
        console.log(`public URL running at: ${tunnel}`);
        console.log(' ------------------------------------------------');
    });
    gulp.watch('./scss/**/*.scss', gulp.series('sass'));
    gulp.watch('./**/*.{html,css,js,php}').on('change', browserSync.reload);
});

// Copy jQuery to /dist/js folder
gulp.task('jquery', function () {
    return gulp.src(['node_modules/jquery/dist/jquery.min.js'])
        .pipe(newer('./dist/js'))
        .pipe(notify({message: 'Copy jQuery to ./dist/js/'}))
        .pipe(gulp.dest('./dist/js'));
});

// Compile sass into CSS (/dist/css/) & auto-inject into browser
gulp.task('sass', function () {
    const processors = [
        mqpacker({sort: true})
    ];
    return gulp.src('./scss/**/*.scss')
        .pipe(plumber({
            errorHandler: notify.onError({
                title: 'SASS compile error!',
                message: '<%= error.message %>'
            })
        }))
        .pipe(sourcemaps.init())
        // outputStyle: nested (default), expanded, compact, compressed
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(prefix("last 2 versions"))
        .pipe(postcss(processors))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./dist/css'));
});

// Optimize CSS just before publishing
gulp.task('minify', function () {
    return gulp.src('./dist/**/*.css')
        .pipe(cleanCSS())
        .pipe(gulp.dest('./dist'));
});

gulp.task('default', gulp.series('jquery', 'sass', 'browser-sync'));
