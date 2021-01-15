## Changelog
## 2.0
- *added* path check. If ffmpegDirectory is not specified it is assumed that ffmpeg is in path
<br><br>
- *fixed* filter options not working properly like fontfile
<br><br>
- *changed* source key in spawn interface is now input
- *changed* from event emitters to async generators
- *changed* there is no default export anymore
<br><br>
- *rewrote* private `__getProgress()` method for more reliable yield's
<br><br>
- *removed* default export use `import { ffmpeg } from "./mod.ts";` or use  
`import { FfmpegClass } from "./mod.ts";`
<br>

## 1.2
- *added* pipe method
- *added* 'data' eventEmitter for pipe method
- *added* fatalError in constructor object
- *added* ffmpeg function as default export. Use `import namehere from "./mod.ts"` for the function and `import {FfmpegClass} from "./mod.ts"`
<br><br>
- *rewrote* constructor into one parameter with an object for everything. Check docs
<br><br>
- *changed* constructer. Now it is one object like with the 
following options `ffmpegDir`, `niceness`(not used on windows), `fatalError`(on by default) and `source` which is the inputfileYou don't need to specify all these, but you can
<br>

## 1.1.1
- *added* url input's
<br><br>
- *changed* variable **sumshit** => to **progressOBJ**
<br>

## 1.1
- *added* noAudio() method
- *added* noVideo() method
- *added* 'progress' eventEmitter
- *added* audiobitrate() method
<br><br>
- *rewrote* videoFilters() method for better filtering
<br><br>
- *changed* addFilters() => videoFilters()
- *changed* ffmpegWrapper.ts => mod.ts
- *changed* [std@0.79.0/node/events.ts](https://deno.land/std@0.79.0/node/events.ts) => [event@0.2.0](https://deno.land/x/event@0.2.0)
- *merged* interfaces.ts & mod.ts
<br><br>
- *fucked* up a bunch
- *removed* deprecated code
- *updated* external libs
<br>

## 1.0
-  Added buggy ffmpeg wrapper