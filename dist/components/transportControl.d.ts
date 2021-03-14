import { Channel } from "tone";
import Metronome from "./metronome";
export default class TransportControl extends Phaser.GameObjects.Container {
    helpText: Phaser.GameObjects.Text;
    bg: Phaser.GameObjects.Rectangle;
    location: Phaser.GameObjects.Text;
    playBtn: Phaser.GameObjects.Image;
    pauseBtn: Phaser.GameObjects.Image;
    stopBtn: Phaser.GameObjects.Image;
    channels: Channel[];
    locationText: Phaser.GameObjects.Text;
    locationTextBars: Phaser.GameObjects.Text;
    locationTextBeats: Phaser.GameObjects.Text;
    locationTextSixteenths: Phaser.GameObjects.Text;
    metronome: Metronome;
    constructor(scene: Phaser.Scene, x: number, y: number, helpText?: Phaser.GameObjects.Text);
    setHelpText(helpText: Phaser.GameObjects.Text): void;
    createChannels(): void;
    createControls(): void;
    update(): void;
}
