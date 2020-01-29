# Node VLC

Inspired by [node-omxplayer](https://github.com/Ap0c/node-omxplayer), `node-vlc` is a simple library for controlling VLC from Node.js.

## Usage
```javascript
const VLC = require('node-vlc');

var player = VLC('/path/to/source_file', {
  /* list of options */
});

player.pause();
```

## API

### VLC(String src, Object options)

- `src`: The video file/url location.

- `options`: List of extra options. See the following properties:
  - `fontColor`: Subtitle font color. See the `VLC_FONT_COLOR_PALETTE` object reference inside `index.js`

  - `fontSize`: Subtitle font size relation. <b>Attention:</b> In VLC this option refers to a relational size not a value in px.

  - `subtitle`: Load this subtitle file. To be used when autodetect cannot detect your subtitle file.
  
  - `subtitleBackgroundOpacity`: Background opacity, must be an integer between `0...255`.

  - `initialVolume`: Initial volume value.

### .play()
Play the video. <i>Only use when paused as it is already playing from the start.</i>

### .pause()
Pause the video.

### .fastFwd()
Fastfoward some seconds.

### .rewind()
Rewind some seconds.

### .quit()
Quit the spawned player.

### .isPlaying()
Returns the playing state.