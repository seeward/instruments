import 'phaser';
import KeyBoard from '../components/keyboard';
import Sampler from '../components/sampler';
import CustomRecorder from '../components/recorder';
import DrumMachine from '../components/drumMachine';
export default class DashboardScene extends Phaser.Scene {
    recorder: CustomRecorder;
    synth: any;
    keys: KeyBoard;
    sampler: Sampler;
    drumMachine: DrumMachine;
    helpText: Phaser.GameObjects.Text;
    constructor();
    startMic(t: any): void;
    loadSounds(t: any): void;
    create(): Promise<void>;
    update(): void;
}
