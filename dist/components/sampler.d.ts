import { AMSynth, DuoSynth, MembraneSynth, PluckSynth, Sequence } from "tone";
import CustomRecorder from "./recorder";
export declare enum loopPatterns {
    sixteenths = "16n",
    quarters = "4n",
    eighths = "8n",
    whole = "1n",
    eighthtriplet = "8t",
    sixtheenthtriplet = "16n"
}
export declare enum Pads {
    kick = 1,
    hat = 2,
    snare = 3,
    ride = 4
}
export default class Sampler extends Phaser.GameObjects.Container {
    kickPad: Phaser.GameObjects.Rectangle;
    snarePad: Phaser.GameObjects.Rectangle;
    hat1Pad: Phaser.GameObjects.Rectangle;
    hat2Pad: Phaser.GameObjects.Rectangle;
    ridePad: Phaser.GameObjects.Rectangle;
    kickPlayer: MembraneSynth;
    snarePlayer: DuoSynth;
    hatPlayer: PluckSynth;
    ridePlayer: AMSynth;
    kickLoop: number;
    selectedPad: Pads;
    snareLoop: Sequence;
    hatLoop: Sequence;
    rideLoop: Sequence;
    kickText: Phaser.GameObjects.Text;
    snareText: Phaser.GameObjects.Text;
    hatText: Phaser.GameObjects.Text;
    rideText: Phaser.GameObjects.Text;
    kickStarter: Phaser.GameObjects.Rectangle;
    snareStarter: Phaser.GameObjects.Rectangle;
    hatStarter: Phaser.GameObjects.Rectangle;
    recorder: CustomRecorder;
    helpText: Phaser.GameObjects.Text;
    notes: string[];
    currentNoteIndex: number;
    constructor(scene: Phaser.Scene, x: number, y: number, helpText?: Phaser.GameObjects.Text, recorder?: CustomRecorder);
    initDrumSounds(): void;
    updatePattern(pad: Pads, pattern: loopPatterns): void;
    makeGrooveControls(): void;
    makeDrumControls(): void;
    startLoop(): void;
    stopLoop(): void;
    update(): void;
}
