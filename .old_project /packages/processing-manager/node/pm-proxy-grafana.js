const express = require("express");

const app = express();
const port = 8000;

require("dotenv").config({ path: __dirname + "/../.env" });

app.use(express.static("view"));

const httpProxy = require("http-proxy");
const proxy = httpProxy.createProxyServer({});

proxy.on("proxyReq", function (proxyReq, req) {
  proxyReq.setHeader("Authorization", "Basic YWRtaW46bTBzYzB3MTk4Mg==");
});

proxy.on("proxyRes", function (proxyRes, req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
});

proxy.on("error", function (err, req, res) {
  res.writeHead(500, { "Content-Type": "text/plain" });
  res.end("An error occured");
});

app.all("/*", function (req, res) {
  proxy.web(req, res, {
    target: "https://grafana.cyoda.com/", // link to our target service
    secure: false,
  });
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
