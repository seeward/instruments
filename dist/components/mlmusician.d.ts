import * as mm from '@magenta/music/es5';
export declare enum ModelCheckpoints {
    DrumRNN = "https://storage.googleapis.com/download.magenta.tensorflow.org/tfjs_checkpoints/music_rnn/drum_kit_rnn",
    ChordImprov = "https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv",
    BasicRNN = "https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn"
}
export default class MachineMusicMan {
    midiDrums: number[];
    reverseMidiMapping: Map<number, number>;
    _player: mm.Player;
    _seq_model: mm.MusicRNN;
    _model_url: ModelCheckpoints;
    _drum_seed: mm.INoteSequence;
    _melody_seed: mm.INoteSequence;
    _temperature: number;
    helpText: Phaser.GameObjects.Text;
    constructor(Model: ModelCheckpoints, helpText?: Phaser.GameObjects.Text);
    setTempo(tempo?: number): void;
    setTempurature(temp: number): void;
    setupModel(): Promise<void>;
    private _onPlayerStart;
    private _onPlayerStop;
    start(): void;
    stop(): void;
    generateNewDrumPart(seed: any, length?: number): Promise<any>;
    toNoteSequence(pattern: any): any;
    fromNoteSequence(seq: any, patternLength: any): any;
}
