import DrumMachine from "./drumMachine";
import PatternPad from "./patternPad";
export default class PatternManager extends Phaser.GameObjects.Container {
    drumMachine: DrumMachine;
    helpText: Phaser.GameObjects.Text;
    pads: PatternPad[];
    resetBtn: Phaser.GameObjects.Ellipse;
    size: string;
    constructor(scene: Phaser.Scene, x: number, y: number, drumMachine?: DrumMachine, helpText?: Phaser.GameObjects.Text, size?: string);
    getPads(): any[];
    addPads(): void;
}
