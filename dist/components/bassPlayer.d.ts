import 'phaser';
import { MonoSynth } from 'tone';
import BassPad from './bassPad';
export default class BassPlayer extends Phaser.GameObjects.Container {
    bg: Phaser.GameObjects.Rectangle;
    synth: MonoSynth;
    notes: string[];
    helpText: Phaser.GameObjects.Text;
    pads: BassPad[];
    resetButton: Phaser.GameObjects.Rectangle;
    volumeLine: Phaser.GameObjects.Rectangle;
    volumeSlide: Phaser.GameObjects.Ellipse;
    constructor(scene: Phaser.Scene, x: number, y: number, helpText?: Phaser.GameObjects.Text);
    setHelpText(helpText: Phaser.GameObjects.Text): void;
    makeSeqPads(): void;
    attachSynth(): void;
    getSynth(): MonoSynth;
    muteAll(): void;
    unmuteAll(): void;
    convertXtoVolume(x: number): number;
    addVolumeControls(): void;
    makeControlSurface(): void;
    clearAll(): void;
    update(): void;
}
