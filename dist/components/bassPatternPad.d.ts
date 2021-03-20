import BassPlayer from "./bassPlayer";
import DrumMachine from "./drumMachine";
import PatternPad from "./patternPad";
import 'phaser';
export default class BasePatternPad extends PatternPad {
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
    bassPlayer: BassPlayer;
    i: number;
    copy: Phaser.GameObjects.Rectangle;
    dragging: boolean;
    constructor(scene: Phaser.Scene, x: number, y: number, drumMachine?: BassPlayer, helpText?: Phaser.GameObjects.Text, logText?: Phaser.GameObjects.Text, i?: number);
    loadSavedKeys(): string[];
    sendPart(): void;
    clearPattern(): void;
    setDragging(): void;
    getPad(): Phaser.GameObjects.Rectangle;
    createPadControl(): void;
    update(): void;
}
