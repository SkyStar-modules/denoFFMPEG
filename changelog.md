# Changelog

## 2.2

- _added_ propper tsdoc's
  <br>

- _updated_ Dependencies

## 2.1

- _added_ `threads()` method to set a custom amount of cpu threads used for
  processing
- _added_ `outputFPS()` method to set a different output fps
- _added_ `setWidth()` method to set a custom width
- _added_ `setHeight()` method to set a custom height
- _added_ `audioFilters()` method. It's almost like videoFilters but for audio
- _added_ `complexFilters()` method. It allow's or complex video/audio filters\
  **Complex filters and simple filters are not compatible!**
  <br>

- _fixed_ progress being wrong when using different output fps
- _fixed_ url input's not outputting progress
- _fixed_ videoFilters not working because they get formatted wrong
  <br>

- _changed_ video & audio codec to use less code
- _changed_ all filter methods to use less code
- _changed_ filters now allow numbers & strings instead of only strings
- _updated_ dependencies

## 2.0

- _added_ path check. If ffmpegDirectory is not specified it is assumed that
  ffmpeg is in path\
  <br>

- _fixed_ filter options not working properly like fontfile
- _changed_ source key in spawn interface is now input
- _changed_ from event emitters to async generators
- _changed_ there is no default export anymore
- _rewrote_ private `__getProgress()` method for more reliable yield's
  <br>

- _removed_ pipe method. It just didn't work. Gonna revisit this in v2.2
- _removed_ default export use `import { ffmpeg } from "./mod.ts";` or use\
  `import { FfmpegClass } from "./mod.ts";`

## 1.2

- _added_ pipe method
- _added_ 'data' eventEmitter for pipe method
- _added_ fatalError in constructor object
- _added_ ffmpeg function as default export. Use
  `import namehere from "./mod.ts"` for the function or
  `import { FfmpegClass } from "./mod.ts"` for the class
  <br>

- _rewrote_ constructor into one parameter with an object for everything. Check
  docs
- _changed_ constructer. Now it is one object like with the following options
  `ffmpegDir`, `niceness` (not used on windows), `fatalError`(on by default) and
  `source` which is the inputfile You don't need to specify all these, but you
  can

## 1.1.1

- _added_ url input's
  <br>

- _changed_ variable **sumshit** => to **progressOBJ**

## 1.1

- _added_ `noAudio()` method
- _added_ `noVideo()` method
- _added_ 'progress' eventEmitter
- _added_ `audiobitrate()` method
  <br>

- _rewrote_ `videoFilters()` method for better filtering
- _changed_ `addFilters()` => `videoFilters()`
- _changed_ `ffmpegWrapper.ts` => `mod.ts`
- _changed_
  [std@0.79.0/node/events.ts](https://deno.land/std@0.79.0/node/events.ts) =>
  [event@0.2.0](https://deno.land/x/event@0.2.0)
- _merged_ interfaces.ts & mod.ts
- _updated_ external libs
  <br>

- _fucked_ up a bunch
- _removed_ deprecated code

## 1.0

- _added_ buggy ffmpeg wrapper
