var gulp = require("gulp");
var fontmin = require("gulp-fontmin");

function minifyFont(text, cb) {
  gulp
    .src("themes/butterfly/source/fonts/DX.woff2") //原字体所在目录
    //.src("themes/butterfly/source/fonts/segoe print.ttf")
    .pipe(
      fontmin({
        text: text,
      })
    )
    .pipe(gulp.dest("themes/butterfly/source/fonts/mini")) //压缩后的输出目录
    .on("end", cb);
}

gulp.task("mini-font", (cb) => {
  var buffers = [];

  gulp
    .src(["./.deploy_git/index.html"]) //HTML文件所在目录请根据自身情况修改
    .on("data", function (file) {
      buffers.push(file.contents);
    })
    .on("end", function () {
      var text = Buffer.concat(buffers).toString("utf-8");
      minifyFont(text, cb);
    });
});

gulp.task("default", gulp.parallel("mini-font"));

/*const gulp = require('gulp');  //如果之前有gulp相关插件，请删除此行代码
const replace = require('gulp-replace');
gulp.task('templates', async() => {
  gulp.src('public/***.*')
    .pipe(replace('https://cdn.jsdelivr.net', 'https://fastly.jsdelivr.net'))
    .pipe(gulp.dest('public/')),  { overwrite: true };
});
gulp.task("default", gulp.parallel('templates'));
*/