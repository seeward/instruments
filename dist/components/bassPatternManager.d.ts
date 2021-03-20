import PatternManager from "./patternManager";
import BassPatternPad from "./bassPatternPad";
import BassPlayer from "./bassPlayer";
export default class BassPatternManager extends PatternManager {
    helpText: Phaser.GameObjects.Text;
    pads: BassPatternPad[];
    resetBtn: Phaser.GameObjects.Ellipse;
    size: string;
    bassPlayer: BassPlayer;
    constructor(scene: Phaser.Scene, x: number, y: number, drumMachine?: BassPlayer, helpText?: Phaser.GameObjects.Text, size?: string);
    getPads(): any[];
    addPads(): void;
}
