const originalConsoleWarn = console.warn;
console.warn = function (message) {
  doSomethingWithWarn(message);
  originalConsoleWarn(message);
};

function doSomethingWithWarn(message) {
  if (message && typeof message === "string" && message.indexOf("Ignoring non-existent input") > -1) {
    throw new Error(message);
  }
}
