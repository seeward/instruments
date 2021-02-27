import 'phaser';
import DashboardScene from './scenes/main'
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
  scene: [PreloadScene, DashboardScene],

};

const game = new Phaser.Game(config);
