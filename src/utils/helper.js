function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms * 1000));
}

module.exports = {
  timeout,
};
