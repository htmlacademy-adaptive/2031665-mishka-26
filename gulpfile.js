import gulp from 'gulp';
import gulpSass from "gulp-sass";
import nodeSass from "node-sass";
import plumber from 'gulp-plumber';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import terser from 'gulp-terser';
import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';
import cheerio from 'gulp-cheerio';
import del from 'del';
import browser from 'browser-sync';

// Styles

export const styles = () => {
return gulp.src('source/sass/style.scss', { sourcemaps: true })
.pipe(plumber())
.pipe(sass())
.pipe(postcss([
autoprefixer(),
csso()
]))
.pipe(rename('style.min.css'))
.pipe(gulp.dest('build/css', { sourcemaps: '.' }))
.pipe(browser.stream());
}

// HTML

const html = () => {
return gulp.src('source/*.html')
.pipe(gulp.dest('build'));
}


const sass = gulpSass(nodeSass);

// Scripts

const scripts = () => {
return gulp.src('source/js/script.js')
.pipe(gulp.dest('build/js'))
.pipe(browser.stream());
}

// Images

export const optimizeImages = () => {
return gulp.src('source/img/**/*.{png,jpg}')
.pipe(squoosh())
.pipe(gulp.dest('build/img'))
}

const copyImages = () => {
return gulp.src('source/img/**/*.{png,jpg}')
.pipe(gulp.dest('build/img'))
}

// WebP

export const createWebp = () => {
return gulp.src('source/img/**/*.{png,jpg}')
.pipe(squoosh({
  encodeOptions: {
    webp: {},
  },
}))
.pipe(gulp.dest('build/img'))
}

// SVG

const svgoConfig = {
  multipass: true,
  plugins: [
    'preset-default',
  ]
}

const svg = () =>
  gulp.src(['source/img/*.svg', '!source/img/icons/*.svg'])
  .pipe(svgo(svgoConfig))
  .pipe(gulp.dest('build/img'));

const sprite = () => {
return gulp.src('source/img/icons/*.svg')
.pipe(cheerio({
  run: ($) => {
      $('[fill="none"]').removeAttr('fill');
  },
  parserOptions: { xmlMode: true }
}))
.pipe(svgo(svgoConfig))
.pipe(svgstore({
inlineSvg: true
}))
.pipe(rename('sprite.svg'))
.pipe(gulp.dest('build/img'));
}

// Copy

const copy = (done) => {
gulp.src([
'source/fonts/*.{woff2,woff}',
'source/*.ico',
], {
base: 'source'
})
.pipe(gulp.dest('build'))
done();
}

// Clean

const clean = () => {
return del('build');
};

// Server

const server = (done) => {
browser.init({
server: {
baseDir: 'build'
},
cors: true,
notify: false,
ui: false,
});
done();
}

// Reload

const reload = (done) => {
browser.reload();
done();
}

// Watcher

const watcher = () => {
gulp.watch('source/sass/**/*.scss', gulp.series(styles));
gulp.watch('source/js/script.js', gulp.series(scripts));
gulp.watch('source/*.html', gulp.series(html, reload));
gulp.watch('source/img/**/*.{jpg,png}', gulp.series(optimizeImages, createWebp, reload));
gulp.watch('source/img/**/*.svg', gulp.series(svg, reload));
gulp.watch('source/img/sprite/*.svg', gulp.series(sprite, reload));
}


// Build

export const build = gulp.series(
clean,
copy,
optimizeImages,
gulp.parallel(
styles,
html,
scripts,
svg,
sprite,
createWebp
),
);

// Default
export default gulp.series(
clean,
copy,
copyImages,
gulp.parallel(
styles,
html,
scripts,
svg,
sprite,
createWebp
),
gulp.series(
server,
watcher
));
