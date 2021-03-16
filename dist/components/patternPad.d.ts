import DrumMachine from "./drumMachine";
export default class PatternPad extends Phaser.GameObjects.Container {
    pad: Phaser.GameObjects.Rectangle;
    helpText: Phaser.GameObjects.Text;
    logText: Phaser.GameObjects.Text;
    hasPattern: boolean;
    drumMachine: DrumMachine;
    pattern: string;
    showingSavedPatterns: boolean;
    savedCards: any;
    savedText: any;
    labelText: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, x: number, y: number, drumMachine?: DrumMachine, helpText?: Phaser.GameObjects.Text, logText?: Phaser.GameObjects.Text);
    loadSavedKeys(): string[];
    sendPart(): void;
    clearPattern(): void;
    createPadControl(): void;
    update(): void;
}
