var CONFIG_FILENAME = 'example01.json';
var config = (new require('../index.js'))(CONFIG_FILENAME);

config.int = config.int? 1+config.int: 1;
console.log('change config.str');
if (!config.str) config.str = 'String';

console.log('add array if not exits');
if (!config.arr) config.arr = [1,2,3];

console.log('push another child to .arr');
config.arr.push({child:true, int:0});

console.log('push another child to .arr');
if (config.arr.length>5)
  delete config.arr[5];

console.log('change an object inside the .arr');
config.arr[config.arr.length-1].int++;

console.log('-----');
console.log('Current value of config')
console.log(config);

console.log('-----');
var fs = require('fs');
console.log('Content of', CONFIG_FILENAME);
var content=fs.readFileSync(CONFIG_FILENAME,'utf8');
console.log(content);