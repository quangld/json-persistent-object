# json-persistent-object
A object that is based on a json file and is written back if any changes made to it.
Its value stays consist even if the app is reloaded.



```js
var JSONPO = require('json-persistent-object')
var config = new JSONPO('config.json');

//add name if it doesn't exist
if (!config.name) config.name = 'testing';

//every time the app is restarted, this config.count will be increased by 1
config.count = config.count? config.count+1 : 0;

if (!config.controller) {
  //initialize default configuration
  config.controller = { timeout: 1, pinMaps: [10, 13] };
}
//...
//later in your code, these changes below will be immediately written back to config.json file
config.controller.pinMaps[1]=12;
config.controller.pinMaps.push(13);

//the content of config.json should be the same as printed by console.log
console.log(config); 

```


## Installation

```bash
$ npm install json-persistent-object
```
