const { spawn } = require('child_process');
const EventEmitter = require('events');

const { log: print } = console;

const VLC_FONT_COLOR_PALETTE = {
  black: 0,
  gray: 8421504,
  silver: 12632256,
  white: 16777215,
  maroon: 8388608,
  red: 16711680,
  fuchsia: 16711935,
  yellow: 16776960,
  olive: 8421376,
  green: 32768,
  teal: 32896,
  lime: 65280,
  purple: 8388736,
  navy: 128,
  blue: 255,
  aqua: 65535,
};

const isString = (str) => typeof str === 'string';
// eslint-disable-next-line no-restricted-globals
const isNumber = (n) => !isNaN(n);
const isMacOs = () => process.platform === 'darwin';

function resolveSubtitleFontColorCode(name) {
  const palette = VLC_FONT_COLOR_PALETTE;
  const dflt = palette[name];
  if (isString(name)) {
    if (palette[name]) {
      return palette[name];
    }
    print(`Unrecognized subtitle font color "${name}"`);
  }
  return dflt;
}

function NodeVLC(...args) {
  let spawned;
  let playing = false;
  const vlcplayer = new EventEmitter();

  const playerArgs = ((src, {
    fontColor = null,
    fontSize = 17,
    subtitle = null,
    subtitleBackgroundOpacity = 0,
    initialVolume = 512,
  }) => {
    if (!isString(src)) {
      throw new Error('Missing vlc source.');
    }
    return {
      src,
      fontColor: resolveSubtitleFontColorCode(fontColor),
      fontSize,
      subtitle,
      subtitleBackgroundOpacity,
      initialVolume,
    };
  })(...args);

  function setPlayingState(bool) {
    playing = bool;
  }

  function writeStdin(eventName) {
    if (!spawned) {
      throw new Error('Player is closed.');
    }
    spawned.stdin.write(`${eventName}\n`);
  }

  function buildArgs({
    src,
    fontColor,
    fontSize,
    subtitle,
    subtitleBackgroundOpacity,
    initialVolume,
  } = {}) {
    // eslint-disable-next-line no-shadow
    const args = [];
    args.push(src);
    args.push('--no-video-title-show');
    if (isNumber(fontColor)) {
      args.push(`--freetype-color=${fontColor}`);
    }
    if (isNumber(fontSize)) {
      args.push(`--freetype-rel-fontsize=${fontSize}`);
    }
    if (isString(subtitle)) {
      args.push(`--sub-file="${subtitle}"`);
    }
    if (isNumber(subtitleBackgroundOpacity)) {
      args.push(`--freetype-background-opacity=${subtitleBackgroundOpacity}`);
    }
    if (isNumber(initialVolume)) {
      args.push(`--volume=${initialVolume}`);
    }
    // enables interactive mode in MacOS
    if (isMacOs()) {
      args.push('--control', 'rc');
    }
    return args;
  }

  function onPlayerClose() {
    print('Player closed.');
    vlcplayer.emit('close');
    spawned = null;
  }

  function onPlayerError(error) {
    print('Player error.');
    print(error);
    vlcplayer.emit('error', error);
  }

  function spawnPlayer() {
    const vlcArgs = buildArgs(playerArgs);
    print('vlc args', vlcArgs);
    try {
      if (isMacOs()) {
        spawned = spawn('/Applications/VLC.app/Contents/MacOS/VLC', vlcArgs);
      } else {
        spawned = spawn('vlc', vlcArgs);
      }
      spawned.stdin.setEncoding('utf-8');
      setPlayingState(true);
      spawned.on('close', onPlayerClose);
      spawned.on('error', onPlayerError);
    } catch (exception) {
      onPlayerError(exception);
    }
  }

  spawnPlayer();

  vlcplayer.play = () => {
    writeStdin('play');
    setPlayingState(true);
  };
  vlcplayer.pause = () => {
    writeStdin('pause');
    setPlayingState(false);
  };
  vlcplayer.fastFwd = () => {
    writeStdin('fastforward');
  };
  vlcplayer.rewind = () => {
    writeStdin('rewind');
  };
  vlcplayer.quit = () => {
    writeStdin('quit');
  };
  vlcplayer.isPlaying = () => !!playing;

  const forceQuit = () => {
    if (vlcplayer) vlcplayer.quit();
    if (spawned) spawned.kill();
  };
  const onProcessExit = (message) => {
    if (isString(message)) {
      print(message);
    }
    process.exit();
  };

  process
    .on('exit', forceQuit)
    .on('SIGINT', onProcessExit)
    .on('SIGUSR1', onProcessExit)
    .on('SIGUSR2', onProcessExit)
    .on('uncaughtException', onProcessExit);

  return vlcplayer;
}

module.exports = NodeVLC;
