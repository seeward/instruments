import 'phaser';
import DrumMachineScene from './scenes/drumMachineScene'
import PreloadScene from './scenes/preload';

const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 720;
const config = {
  physics: { default: "arcade" },
  type: Phaser.AUTO,
  backgroundColor: "#ffffff",
  scale: {
    parent: "game",
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT
  },
  scene: [PreloadScene, DrumMachineScene],

};

const game = new Phaser.Game(config);
