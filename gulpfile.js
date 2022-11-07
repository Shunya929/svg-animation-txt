import gulp  from'gulp';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
const sass = gulpSass( dartSass );
import plumber  from 'gulp-plumber'; //エラー時の強制終了を防止
import notify  from 'gulp-notify'; //エラー発生時にデスクトップ通知する
import sassGlob  from 'gulp-sass-glob-use-forward'; //@importの記述を簡潔にする(※gulp-sass-glob→gulp-sass-glob-use-forwardにした)
import browserSync  from  'browser-sync' ; //ブラウザ反映
import postcss  from 'gulp-postcss'; //autoprefixerとセット
import autoprefixer  from 'autoprefixer'; //ベンダープレフィックス付与
import cssdeclsort  from 'css-declaration-sorter'; //css並べ替え
import imagemin  from 'gulp-imagemin';
import optipng  from 'imagemin-optipng';
import mozjpeg  from 'imagemin-mozjpeg';
import ejs  from "gulp-ejs";
import rename  from "gulp-rename"; //.ejsの拡張子を変更
gulp.task('sass', function() {
return gulp
.src( './scss/**/*.scss' )
.pipe( plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }) )//エラーチェック
.pipe( sassGlob() )//importの読み込みを簡潔にする
.pipe( sass({
outputStyle: 'expanded' //expanded, nested, campact, compressedから選択
}) )
.pipe( postcss([ autoprefixer(
{
// ☆IEは11以上、Androidは5以上
// その他は最新2バージョンで必要なベンダープレフィックスを付与する
"overrideBrowserslist": ["last 2 versions", "ie >= 11", "Android >= 5"],
cascade: false}
) ]) )
.pipe( postcss([ cssdeclsort({ order: 'alphabetical' }) ]) )//プロパティをソートし直す(アルファベット順)
.pipe(gulp.dest('./css'));//コンパイル後の出力先
});
// 保存時のリロード
gulp.task( 'browser-sync', function(done) {
browserSync.init({
//ローカル開発
server: {
baseDir: "./",
index: "index.html"
}
});
done();
});
gulp.task( 'bs-reload', function(done) {
browserSync.reload();
done();
});
gulp.task("ejs", (done) => {
gulp
.src(["ejs/**/*.ejs", "!" + "ejs/**/_*.ejs"])
.pipe( plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }) )//エラーチェック
.pipe(ejs())
.pipe(rename({extname: ".html"})) //拡張子をhtmlに
.pipe(gulp.dest("./")); //出力先
done();
});
// 監視
gulp.task( 'watch', function(done) {
gulp.watch( './scss/**/*.scss', gulp.task('sass') ); //sassが更新されたらgulp sassを実行
gulp.watch('**/*.html', gulp.task('bs-reload')); //htmlが更新されたらbs-reloadを実行
gulp.watch('**/*.php', gulp.task('bs-reload')); //phpが更新されたらbs-reloadを実行
gulp.watch('./scss/**/*.scss', gulp.task('bs-reload')); //sassが更新されたらbs-reloadを実行
gulp.watch( './js/*.js', gulp.task('bs-reload') ); //jsが更新されたらbs-relaodを実行
gulp.watch('./ejs/**/*.ejs',gulp.task('ejs') ) ; //ejsが更新されたらgulp-ejsを実行
gulp.watch('./ejs/**/*.ejs',gulp.task('bs-reload') ) ; //ejsが更新されたらbs-reloadを実行
});
// default
gulp.task('default', gulp.series(gulp.parallel('browser-sync', 'watch')));
//圧縮率の定義
var imageminOption = [
optipng({ optimizationLevel: 5 }),
mozjpeg({ quality: 85 }),
imagemin.gifsicle({
interlaced: false,
optimizationLevel: 1,
colors: 256
}),
imagemin.mozjpeg(),
imagemin.optipng(),
imagemin.svgo()
];
// 画像の圧縮
// $ gulp imageminで./src/img/base/フォルダ内の画像を圧縮し./src/img/フォルダへ
// .gifが入っているとエラーが出る
gulp.task('imagemin', function () {
return gulp
.src('./img/*.{png,jpg,gif,svg}')
.pipe(imagemin(imageminOption))
.pipe(gulp.dest('./img'));
});