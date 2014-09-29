var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var cssMini = require('gulp-minify-css');
var rimraf = require('gulp-rimraf');
var zip = require('gulp-zip');
var pjson = require("./package.json");
var streamqueue = require("streamqueue");
var concat = require("gulp-concat");
var runSequence = require("run-sequence");
var replace = require("gulp-replace");
var jshint = require("gulp-jshint");

var rev = require('gulp-rev');
//var log = require('./component/logger')('gulpfiles');


/**
 * Build the project
 */
gulp.task("default", function (callback) {
    runSequence("clean", "css", "js", "html", "zip", callback);
});

/**
 * check js error
 */
gulp.task('check',function(){
   gulp.src([
       'bin/*.js',
       'component/*.js',
       'controller/*.js',
       'model/*.js',
       'app.js',
       'static/www/**/*.js',
       'gulpfile.js'
   ]).pipe(jshint())
       .pipe(jshint.reporter('default'));
});

/**
 * clean build path
 */
gulp.task('clean', function () {
    return gulp.src('build/*', {read: false}).pipe(rimraf());
});

/**
 * minify app js
 */
gulp.task('appjs', function () {
    gulp.src('static/js/app/app.js')
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify())
        .pipe(gulp.dest('build/static/js/app/'));
});

/**
 * Build a single js file
 **/
gulp.task("js", ['appjs'], function () {
    var stream = streamqueue({ objectMode: true });

    //  require jQuery and Handlebars to be defined first
    stream.queue(
        gulp.src([
            "static/js/vendors/jquery*.min.js",
            "static/js/vendors/dust-core.min.js",
            "static/js/vendors/chosen.jquery.min.js",
            "static/js/vendors/dust-helpers.min.js"
        ])
    );

//
//    // vendors libraries already minified  but jQuery already added before
//    stream.queue(
//        gulp.src([
//            "static/js/vendors/*.min.js",
//            "!static/js/vendors/jquery*.min.js",
//            "!static/js/vendors/dust-core.min.js"
//        ])
//    );


    // precompile template and concat them into a virtual file (vinyl)
    stream.queue(
        gulp.src('views/*.dust')
            .pipe(dust())
    );

    // once preprocess ended, concat result into a real file
    return stream.done()
        .pipe(concat("all.js"))
        .pipe(rename({ suffix: '.min' }))
        .pipe(rev())
        .pipe(gulp.dest("build/static/js/"))
        .pipe(rev.manifest())
        .pipe(gulp.dest("build/static/js/"));
});

gulp.task('css', function () {
    gulp.src('static/css/*.css')
        .pipe(concat("all.css"))
        .pipe(cssMini())
        .pipe(rename({ suffix: '.min' }))
        .pipe(rev())
        .pipe(gulp.dest('build/static/css'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('build/static/css'));
});

gulp.task('html', function () {
    var css = require('./build/static/css/rev-manifest.json');
    var cssName = css['all.min.css'];
    var replaceCss = true;
    var js = require('./build/static/js/rev-manifest.json');
    var jsName = js['all.min.js'];
    var replaceJs = true;
    return gulp.src('static/html/*.html')
        // replace the first css requirement and remove the others
        .pipe(replace(/<\s*link.+\/css\/.+\/\s*>/g, function(match){
            var result = replaceCss ? match.replace(/(href=['"][^'"]+css\/)[^'"]+(['"])/, "$1" + cssName + "$2") : "";
            replaceCss = false;
            return result;
        }))
        // replace the first js requirement and remove the others
        .pipe(replace(/<\s*script.+\/js\/[vendors||tmpl].+<\s*\/\s*script\s*>/g, function (match) {
            var result = replaceJs ? match.replace(/(src=['"][^'"]+js\/)[^'"]+(['"])/, "$1" + jsName + "$2") : "";
            replaceJs = false;
            return result;
        }))
        .pipe(replace(/<\s*script.+\/js\/app.+<\s*\/\s*script\s*>/g, function (match) {
            return match.replace(/\.js(['"]\s*>)/, ".min.js$1");
        }))
        .pipe(replace(/^\s*[\r\n]/gm, ''))
        .pipe(gulp.dest('build/static/html/'));
});


gulp.task('watch', function () {
    gulp.watch('src/tmpl/*.dust', ['dust']);
});


gulp.task('dust', function () {
    gulp.src('views/*.dust')
        .pipe(dust())
        .pipe(gulp.dest('static/js/tmpl'));
});


gulp.task('zip', function () {
    var date = new Date().toISOString().replace(/[^0-9]/g, ''),
        stream = streamqueue({ objectMode: true });
    stream.queue(
        gulp.src(
            [
                'bin/*',
                'component/*',
                'controller/*',
                'model/*',
                'static/images/*',
                'config.json',
                'app.js',
                'package.json'
            ],
            {base: '.'}).pipe(gulp.dest('build/'))
    );
    stream.queue(
        gulp.src("build/**/*", {base: "build/"})
    );
    return stream.done().pipe(zip(pjson.name + "-" + pjson.version + "-" + date + ".zip"))
        .pipe(gulp.dest("dist/"));
});

