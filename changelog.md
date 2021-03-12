# Changelog

## 2.2

- *added* propper tsdoc's
<br>

- *updated* Dependencies

## 2.1

- *added* `threads()` method to set a custom amount of cpu threads used for processing
- *added* `outputFPS()` method to set a different output fps
- *added* `setWidth()` method to set a custom width
- *added* `setHeight()` method to set a custom height
- *added* `audioFilters()` method. It's almost like videoFilters but for audio
- *added* `complexFilters()` method. It allow's or complex video/audio filters  
**Complex filters and simple filters are not compatible!**
<br>

- *fixed* progress being wrong when using different output fps
- *fixed* url input's not outputting progress
- *fixed* videoFilters not working because they get formatted wrong
<br>

- *changed* video & audio codec to use less code
- *changed* all filter methods to use less code
- *changed* filters now allow numbers & strings instead of only strings
- *updated* dependencies

## 2.0

- *added* path check. If ffmpegDirectory is not specified it is assumed that ffmpeg is in path  
<br>

- *fixed* filter options not working properly like fontfile
- *changed* source key in spawn interface is now input
- *changed* from event emitters to async generators
- *changed* there is no default export anymore
- *rewrote* private `__getProgress()` method for more reliable yield's
<br>

- *removed* pipe method. It just didn't work. Gonna revisit this in v2.2
- *removed* default export use `import { ffmpeg } from "./mod.ts";` or use  
`import { FfmpegClass } from "./mod.ts";`

## 1.2

- *added* pipe method
- *added* 'data' eventEmitter for pipe method
- *added* fatalError in constructor object
- *added* ffmpeg function as default export. Use `import namehere from "./mod.ts"` for the function or `import { FfmpegClass } from "./mod.ts"` for the class
<br>

- *rewrote* constructor into one parameter with an object for everything. Check docs
- *changed* constructer. Now it is one object like with the
following options `ffmpegDir`, `niceness` (not used on windows), `fatalError`(on by default) and `source` which is the inputfile You don't need to specify all these, but you can

## 1.1.1

- *added* url input's
<br>

- *changed* variable **sumshit** => to **progressOBJ**

## 1.1

- *added* `noAudio()` method
- *added* `noVideo()` method
- *added* 'progress' eventEmitter
- *added* `audiobitrate()` method
<br>

- *rewrote* `videoFilters()` method for better filtering
- *changed* `addFilters()` => `videoFilters()`
- *changed* `ffmpegWrapper.ts` => `mod.ts`
- *changed* [std@0.79.0/node/events.ts](https://deno.land/std@0.79.0/node/events.ts) => [event@0.2.0](https://deno.land/x/event@0.2.0)
- *merged* interfaces.ts & mod.ts
- *updated* external libs
<br>

- *fucked* up a bunch
- *removed* deprecated code

## 1.0

- *added* buggy ffmpeg wrapper
