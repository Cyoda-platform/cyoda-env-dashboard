import "jquery-ui/themes/base/all.css";

let $ = require("jquery");
$ = $.extend(require("jquery-ui/ui/widgets/draggable.js"));
$ = $.extend(require("jquery-ui/ui/widgets/resizable.js"));
window.$ = $;
window.jQuery = $;
