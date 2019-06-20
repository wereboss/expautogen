// Initialize modules
// Importing specific gulp API functions lets us write them below as series() instead of gulp.series()
const { src, dest, watch, series, parallel } = require("gulp");
// Importing all the Gulp-related packages we want to use
const sourcemaps = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const replace = require("gulp-replace");
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");
const htmlmin = require("gulp-htmlmin");
const minifyImg = require("gulp-imagemin");

var paths = {
  dirs: {
    build: ".build",
    dist: "public"
  },
  html: { src: "*.html", dest: "public" },
  images: { src: "images/**/*.{JPG,jpg,png,gif}", dest: "public/images" },
  json: { src: "json/**/*.json", dest: "public/json" },
  sass: { src: "sass/**/*.scss", dest: "public/stylesheets" },
  tsmain: { src: "*.ts", dest: "public" },
  ts: { src: "ts/**/*.ts", dest: "js" },
  js: { src: "js/**/*.js", dest: "public/javascripts" },
  cb: { src: "views/layouts/**/*.hbs", dest: "views/layouts" }
};

// Sass task: compiles the style.scss file into style.css
function scssTask() {
  return src(paths.sass.src)
    .pipe(sourcemaps.init()) // initialize sourcemaps first
    .pipe(sass()) // compile SCSS to CSS
    .pipe(postcss([autoprefixer(), cssnano()])) // PostCSS plugins
    .pipe(sourcemaps.write(".")) // write sourcemaps file in current directory
    .pipe(dest(paths.sass.dest)); // put final CSS in dist folder
}

//Images
function imgTask() {
  return src(paths.images.src)
    .pipe(minifyImg())
    .pipe(dest(paths.images.dest));
}

//Typescript
function tsTask() {
  return tsProject
    .src()
    .pipe(tsProject())
    .pipe(dest(paths.tsmain.dest));
}

//Javascript
function jsTask() {
  return src(paths.js.src)
    .pipe(concat("all.js"))
    .pipe(uglify())
    .pipe(dest(paths.js.dest));
}

// Cachebust
var cbString = new Date().getTime();
function cacheBustTask() {
  return src(paths.cb.src)
    .pipe(replace(/cb=\d+/g, "cb=" + cbString))
    .pipe(dest(paths.cb.dest));
}

// Copy html
function htmlTask() {
  return src(paths.html.src)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest(paths.html.dest));
}

// Watch task: watch SCSS and JS files for changes
// If any change, run scss and js tasks simultaneously
function watchTask() {
  watch(paths.sass.src, series(scssTask, cacheBustTask, htmlTask));
  watch(paths.ts.src, series(tsTask, jsTask, cacheBustTask, htmlTask));
  watch(paths.tsmain.src, series(tsTask, jsTask, cacheBustTask, htmlTask));
  watch(paths.html.src, htmlTask);
  watch(paths.images.src, imgTask);
  //    watch([files.scssPath, files.jsPath],parallel(scssTask, jsTask));
}

// Export the default Gulp task so it can be run
// Runs the scss and js tasks simultaneously
// then runs cacheBust, then watch task
exports.default = series(
  scssTask,
  tsTask,
  jsTask,
  cacheBustTask,
  htmlTask,
  imgTask,
  watchTask
);
