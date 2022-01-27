// Credit Tautulli
const plex_oauth_loader =
  "<style>" +
  ".login-loader-container {" +
  'font-family: "Open Sans", Arial, sans-serif;' +
  "position: absolute;" +
  "top: 0;" +
  "right: 0;" +
  "bottom: 0;" +
  "left: 0;" +
  "}" +
  ".login-loader-message {" +
  "color: #282A2D;" +
  "text-align: center;" +
  "position: absolute;" +
  "left: 50%;" +
  "top: 25%;" +
  "transform: translate(-50%, -50%);" +
  "}" +
  ".login-loader {" +
  "border: 5px solid #ccc;" +
  "-webkit-animation: spin 1s linear infinite;" +
  "animation: spin 1s linear infinite;" +
  "border-top: 5px solid #282A2D;" +
  "border-radius: 50%;" +
  "width: 50px;" +
  "height: 50px;" +
  "position: relative;" +
  "left: calc(50% - 25px);" +
  "}" +
  "@keyframes spin {" +
  "0% { transform: rotate(0deg); }" +
  "100% { transform: rotate(360deg); }" +
  "}" +
  "</style>" +
  '<div class="login-loader-container">' +
  '<div class="login-loader-message">' +
  '<div class="login-loader"></div>' +
  "<br>" +
  "Redirecting to the Plex login page..." +
  "</div>" +
  "</div>";

export default function oAuthWindow(url, title, w, h) {
  // Fixes dual-screen position | credit Tautulli
  var dualScreenLeft =
    window.screenLeft !== undefined ? window.screenLeft : window.screenX;
  var dualScreenTop =
    window.screenTop !== undefined ? window.screenTop : window.screenY;

  var width = window.innerWidth
    ? window.innerWidth
    : document.documentElement.clientWidth
    ? document.documentElement.clientWidth
    : window.screen.width;
  var height = window.innerHeight
    ? window.innerHeight
    : document.documentElement.clientHeight
    ? document.documentElement.clientHeight
    : window.screen.height;

  var left = width / 2 - w / 2 + dualScreenLeft;
  var top = height / 2 - h / 2 + dualScreenTop;
  var newWindow = window.open(
    url,
    title,
    "scrollbars=yes, width=" +
      w +
      ", height=" +
      h +
      ", top=" +
      top +
      ", left=" +
      left
  );

  if (window.focus) newWindow.focus();
  newWindow.document.body.innerHTML = plex_oauth_loader;
  return newWindow;
}
