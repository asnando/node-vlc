const VLC = require('./');

const { log: print } = console;

const player = VLC('http://127.0.0.1:8888/', {
  fontSize: 16,
  fontColor: 'yellow',
  subtitle: '~/Downloads/subtitle.srt',
  subtitleBackgroundOpacity: 255,
});

setTimeout(() => player.pause(), 5000);
setTimeout(() => player.play(), 8000);
setTimeout(() => player.fastFwd(), 12000);
setTimeout(() => player.rewind(), 17000);
setTimeout(() => player.volDown(), 22000);
setTimeout(() => player.volUp(), 27000);

player.on('error', (error) => print(error));
player.on('close', () => print('closed!'));

process.stdin.resume();
