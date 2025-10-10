const fs = require("fs");
function main() {
  const pwd = __dirname;
  fs.writeFileSync(
    `${pwd}/../dist/package.json`,
    JSON.stringify({
      name: "dist",
      version: "1.0.0",
      description: "",
      main: "index.js",
      scripts: {
        serve: "http-server --proxy http://localhost:8080?",
      },
      author: "",
      license: "ISC",
      dependencies: {
        "http-server": "^14.0.0",
      },
    })
  );
}

main();
