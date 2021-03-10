import 'phaser';

export const generateColor = (low?: number, high?: number):number => {
  const color = new Phaser.Display.Color();
  color.random(low ? low : 200, high ? high : 255);
  // color.random(low ? low : 100, high ? high : 155);
  return color.color;
};





