// Initialize modules
// Importing specific gulp API functions lets us write them below as series() instead of gulp.series()
const { src, dest, watch, series, parallel } = require("gulp");
// Importing all the Gulp-related packages we want to use
const sourcemaps = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify-es").default;
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const replace = require("gulp-replace");
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");
const htmlmin = require("gulp-htmlmin");
const minifyImg = require("gulp-imagemin");
const nodemon = require("gulp-nodemon");
const clean = require("gulp-clean");

var paths = {
  dirs: {
    build: ".build",
    dist: "public/*"
  },
  html: { src: "src/html/*.html", dest: "public/html" },
  images: { src: "src/img/**/*.{JPG,jpg,png,gif}", dest: "public/img" },
  json: { src: "src/json/**/*.json", dest: "public/json" },
  sass: { src: "src/sass/**/*.scss", dest: "public/css" },
  tsmain: { src: "*.ts", dest: "." },
  ts: { src: "src/ts/**/*.js", dest: "public/js" },
  js: { src: "src/{js/**/*.js,ts/**/*.js}", dest: "public/js" },
  cb: { src: "views/layouts/**/*.hbs", dest: "views/layouts" }
};

//Clean
function cleanTask() {
  return src(paths.dirs.dist, { allowEmpty: true, read: false }).pipe(clean());
}

//Nodemon
function nodemonTask(done) {
  var stream = nodemon({
    script: "main.js",
    ext: "html js",
    done: done
  });
  stream
    .on("restart", function() {
      console.log("restarted!");
    })
    .on("crash", function() {
      console.error("Application has crashed!\n");
      stream.emit("restart", 10); // restart the server in 10 seconds
    });
}

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
function tsJoin() {
  return src(paths.ts.src)
    .pipe(concat("combined.ts"))
    .pipe(dest(paths.ts.dest));
}
function tscleanTask() {
  return src(paths.ts.src, { allowEmpty: true, read: false }).pipe(clean());
}
function tsTask() {
  return tsProject
    .src()
    .pipe(tsProject())
    .pipe(dest(paths.tsmain.dest));
}

//Javascript
function jsTask() {
  return src(paths.js.src)
    .pipe(concat("common.js"))
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
async function watchTask() {
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
  cleanTask,
  scssTask,
  tsTask,
  jsTask,
  htmlTask,
  imgTask,
  parallel(nodemonTask, watchTask)
);
exports.test = series(tsTask,jsTask);
