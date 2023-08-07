const path = require("path");
const webpack = require("webpack");
const childProcess = require("child_process"); // prcoess의 정보 얻어내기 가능 여기에서는 git 정보 자동추출
const HtmlWebPackPlugin = require("html-webpack-plugin"); //
const { CleanWebpackPlugin } = require("clean-webpack-plugin"); // build 할 때마다 dist 날리고 다시 생성하게함.
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const apiMocker = require("connect-api-mocker"); // 목업
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin"); // 최적화 : css 압축(빈칸제거)
const TerserPlugin = require("terser-webpack-plugin"); //
const CopyPlugin = require("copy-webpack-plugin");

const mode = process.env.NODE_ENV || "development";

module.exports = {
  mode,
  entry: {
    main: "./src/app.js",
    result: "./src/app.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    publicPath: "/",
    host: "localhost",
    overlay: true, // 빌드시 에러나 경고를 브라우져 화면에 표시
    port: 8081,
    stats: "errors-only",
    before: (app) => {
      app.use(apiMocker("/api", "mocks/api"));
    },
    historyApiFallback: true, // historyAPI로 SPA 개발 시, 404 발생하면 index.html로 리다이렉트
    hot: true,
  },
  optimization: {
    minimizer:
      mode === "production"
        ? [
            new OptimizeCSSAssetsPlugin(),
            new TerserPlugin({
              terserOptions: {
                compress: {
                  drop_console: true, // 콘솔 로그를 제거한다
                },
              },
            }),
          ]
        : [],
    splitChunks: {
      chunks: "all",
    },
  },
  externals: {
    // 각 import axios하면 무거우니 전역변수 처럼 사용해버리기
    axios: "axios",
  },
  module: {
    rules: [
      // loader는 module객체의 rules에서 정한다.
      {
        // test: /\.js$/, // 패턴이라 정규표현식의 형태를 띔. 여기서는 .js로 끝나는 모든 확장자를 의미한다.
        // use: [path.resolve("./my-webpack-loader.js")],

        test: /\.css$/,
        // use: ["css-loader"], // module은 js이기 때문에 css->js문자열로 바꿔주는 css-loader를 사용해야한다.
        use: ["style-loader", "css-loader"], // style-loader는 css->html dom안으로 넣어준다. 순서는 css-loader => style-loader로 작동한다.
      },
      {
        test: /\.png$/,
        use: {
          loader: "file-loader",
          options: {
            // publicPath: "./dist/",
            name: "[name].[ext]",
          },
        },
      },
      {
        test: /\.(jpeg)$/,
        use: {
          loader: "url-loader",
          options: {
            publicPath: "./dist/",
            name: "[name].[ext]?[contenthash]",
            limit: 20000, // 2kb
          },
        },
        //   // use: ["file-loader"] 사진은 file-loader로 따로 url 처리 필요 -> 위처럼 옵션을 통해 경로도 설정할 수 있다.
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader", // 바벨 로더를 추가한다
      },
    ],
  },

  // 모듈은 각각 실행되고, plugin은 번들된 것에 한 번 실행됨.
  plugins: [
    new webpack.BannerPlugin({
      banner: `
        Build Date: ${new Date().toLocaleString()}
        Author: ${childProcess.execSync("git config user.name")}
    `,
    }),
    new webpack.DefinePlugin({
      TWO: "1+1",
      STRING_TWO: JSON.stringify("1+1"),
      "api.domin": JSON.stringify("http"),
    }),
    new HtmlWebPackPlugin({
      template: "./src/index.html",
      templateParameters: {
        env: process.env.NODE_ENV === "development" ? "개발용" : "배포용",
      },
      minify: {},
    }),
    new CleanWebpackPlugin(),
    ...(process.env.NODE_ENV === "production"
      ? [new MiniCssExtractPlugin({ filename: "[name].css" })]
      : []),
    new CopyPlugin([
      {
        from: "./node_modules/axios/dist/axios.min.js",
        to: "./axios.min.js", // dist 목적지 파일에 들어간다
      },
    ]),
  ],
};
