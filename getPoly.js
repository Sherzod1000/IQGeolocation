const asd = "asdasd";

console.log(asd);

process.argv.forEach(function (val, index, array) {
  console.log(index + ": " + val);
});
