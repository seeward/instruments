import 'phaser';
import KeyBoard from '../components/keyboard';
import Sampler from '../components/sampler';
import CustomRecorder from '../components/recorder';
import DrumMachine from '../components/drumMachine';
import BassPlayer from '../components/bassPlayer';
import TransportControl from '../components/transportControl';
import EffectControls from "../components/effectControls";
import PatternManager from '../components/patternManager';
export default class DashboardScene extends Phaser.Scene {
    recorder: CustomRecorder;
    synth: any;
    keys: KeyBoard;
    sampler: Sampler;
    drumMachine: DrumMachine;
    helpText: Phaser.GameObjects.Text;
    logText: Phaser.GameObjects.Text;
    transport_: TransportControl;
    bassPlayer_: BassPlayer;
    effects: EffectControls;
    worker: Worker;
    footer: Phaser.GameObjects.Rectangle;
    footer2: Phaser.GameObjects.Rectangle;
    bg1: Phaser.GameObjects.Rectangle;
    patterns: PatternManager;
    constructor();
    create(): Promise<void>;
    update(): void;
}
