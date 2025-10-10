const express = require("express");

const app = express();
const port = 8002;

const args = process.argv.slice(2);

const isDevelop = args.indexOf("--dev") > -1;

require("dotenv").config({ path: __dirname + "/../.env" });

app.use(express.static("view"));

const httpProxy = require("http-proxy");
const proxy = httpProxy.createProxyServer({});

proxy.on("proxyRes", function (proxyRes, req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
});

proxy.on("error", function (err, req, res) {
  res.writeHead(500, { "Content-Type": "text/plain" });
  res.end("An error occured");
});

app.all("/*", function (req, res) {
  const node = req.query.node;
  if (node) {
    proxy.web(req, res, {
      target: `http://${node}${isDevelop ? ":8081" : ""}/`, // link to our target service
      secure: false,
    });
  }
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
