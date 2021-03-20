import { Loop } from "tone";
import BassPatternManager from "./bassPatternManager";
import BassPlayer from "./bassPlayer";
import DrumMachine from "./drumMachine";
import PatternManager from "./patternManager";
declare class myRect extends Phaser.GameObjects.Rectangle {
    pattern: string;
    patternLabel: string;
    setLabel?: (l: string) => void;
}
export default class Looper extends Phaser.GameObjects.Container {
    bg: Phaser.GameObjects.Rectangle;
    drumSeqs: any;
    drumSeqIndex: number;
    zones_drums: myRect[];
    zones_bass: myRect[];
    bg2: Phaser.GameObjects.Rectangle;
    bassPatterns: BassPatternManager;
    drumPatterns: PatternManager;
    labelText: Phaser.GameObjects.Text[];
    resetBassPatterns: Phaser.GameObjects.Ellipse;
    helpText: Phaser.GameObjects.Text;
    dragging: boolean;
    pattern: string;
    i: number;
    drumMachine: DrumMachine;
    bassPlayer: BassPlayer;
    patternLength: number;
    mainSequences: any[];
    loop: Loop<any>;
    constructor(scene: Phaser.Scene, x: number, y: number, bassPatterns: BassPatternManager, drumPatterns: PatternManager, drumMachine: DrumMachine, bassPlayer: BassPlayer, helpText?: Phaser.GameObjects.Text);
    getPatterns(): any[];
    makeMainPattern(): void;
    clearPatterns(): void;
    addLabel(obj: any): void;
    removeLabel(obj: any): void;
    loadSequences(): void;
    makeBackground(): void;
    makeControlSurface(): void;
    update(): void;
}
export {};
