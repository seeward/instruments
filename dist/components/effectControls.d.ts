import { AMSynth, AutoWah, Chorus, Delay, Distortion, FMSynth, MembraneSynth, MonoSynth, Phaser as _phaser, PingPongDelay, Player, PluckSynth, PolySynth } from "tone";
import 'phaser';
export declare enum Pads {
    pad0 = 0,
    pad1 = 1,
    pad2 = 2,
    pad3 = 3,
    pad4 = 4,
    pad5 = 5
}
export default class EffectControls extends Phaser.GameObjects.Container {
    pad0: Phaser.GameObjects.Rectangle;
    pad1: Phaser.GameObjects.Rectangle;
    pad2: Phaser.GameObjects.Rectangle;
    pad3: Phaser.GameObjects.Rectangle;
    pad4: Phaser.GameObjects.Rectangle;
    pad5: Phaser.GameObjects.Rectangle;
    activePad: number | undefined;
    pads: string[];
    muted: boolean;
    effects: string[];
    helpText: Phaser.GameObjects.Text;
    effectBG: Phaser.GameObjects.Rectangle;
    effectBGInner: Phaser.GameObjects.Rectangle;
    effectStick: Phaser.GameObjects.Rectangle;
    effectStickInner: Phaser.GameObjects.Ellipse;
    delayControl: Phaser.GameObjects.Ellipse;
    effectConnectFlag: any;
    synth: any;
    distControl: Phaser.GameObjects.Ellipse;
    distConnectFlag: any;
    dist: any;
    effectObjects: Delay | PingPongDelay | Distortion | AutoWah | Chorus | _phaser[];
    keys: PluckSynth | PolySynth | FMSynth | AMSynth | MembraneSynth;
    drums: Player[];
    bass: MonoSynth;
    keysBtn: Phaser.GameObjects.Rectangle;
    connections: {
        keys: any[];
        drums: any[];
        bass: any[];
    };
    drumsBtn: Phaser.GameObjects.Rectangle;
    bassBtn: Phaser.GameObjects.Rectangle;
    constructor(scene: Phaser.Scene, x: number, y: number, drums?: Player[], bass?: MonoSynth, keys?: PluckSynth | PolySynth | FMSynth | AMSynth | MembraneSynth, helpText?: Phaser.GameObjects.Text);
    initEffects(): void;
    getBetweenZeroAndOne(val: any, max: any, min: any): number;
    convertXToEffectParam1(x: number): number;
    convertYToEffectParam2(y: number): number;
    getEffectParams(eff: string): string[];
    addEffectControls(): void;
    effect(effect: any): void;
    connectEffect(dest: string): void;
    disconnectEffect(dest: string): void;
    disconnectAll(): void;
    createSamplerControls(): void;
    muteAllPads(): void;
    unMuteAllPads(): void;
    update(): void;
}
