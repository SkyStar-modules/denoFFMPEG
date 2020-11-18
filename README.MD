<h1 align=center>Deno FFMPEG</h1>
<h3>FFmpeg is really nice to use and quite handy for alot of applications.<br>But we didn't have any easy wrapper for it in Deno!<br>So now we do :D</h3>
<hr><br>
<h2>List of features</h2>

<ul>
<li>Video bitrate(VBR and CBR)</li>
<li>FFMPEG Filters</li>
<li>Easy to use</li>
<li>All methods are chainable</li>
<li>Frequently updated and maintained by me</li>
</ul>
<br>
<hr>
<h2> Example </h2>

```js
import { ffmpeg } from "./ffmpegWrapper.ts";
let videoRender = new ffmpeg("PATHTOFFMPEG", "PATHTOVIDEOFILE");
videoRender.videoBitrate(1000).save("./ree.mp4");
```
<hr>
<h2>Documentation</h2>
<h3>All documentation for every method is explained <a href=>here</a>
<br>Everything else should be fairly easy</h3><br><hr>
<h2>Contributing</h2>
<h3>If you want to add a filter or a feature just make a pull request. I won't pull code modifications, but I will add filter interfaces</h3>
<br><hr>
<h2>Authors or Acknowledgments</h2>
<ul>
<li>Christiaan "MierenMans" van Boheemen - Author</li>
<li>Robin "Dubbel" Noort - Wrapper Idea</li>
</ul>
<br>

<h1>License</h1>
Copyright 2020 Christiaan "MierenMans" van Boheemen

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.