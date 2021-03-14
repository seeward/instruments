import { MonoSynth, Player } from 'tone';
import DrumPad from './drumPad';
export default class BassPad extends DrumPad {
    note: string;
    synth: MonoSynth;
    constructor(scene: Phaser.Scene, x: number, y: number, sound: string, synth?: MonoSynth, helpText?: Phaser.GameObjects.Text, player?: Player);
    setUpSounds(): void;
    makeSeqCircle(inx: number, xSpace: number, scene: Phaser.Scene): Phaser.GameObjects.Ellipse;
    makeSequenceControls(): void;
    hitSeqCircle(i: number, t: Phaser.Scene): void;
    hitSeqOffBeats(i: number, t: Phaser.Scene): void;
    makePattern(index?: number, self?: Phaser.Scene): void;
    update(): void;
}
