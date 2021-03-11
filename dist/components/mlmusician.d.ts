import * as mm from '@magenta/music/es5';
export declare enum ModelCheckpoints {
    DrumRNN = "https://storage.googleapis.com/download.magenta.tensorflow.org/tfjs_checkpoints/music_rnn/drum_kit_rnn",
    ChordImprov = "https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv",
    BasicRNN = "https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn",
    ImprovRNN = "https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv",
    MelodyVAE = "https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_4bar_small_q2"
}
export default class MachineMusicMan {
    _player: mm.Player;
    _seq_model: mm.MusicRNN | mm.MusicVAE | mm.Coconet;
    _model_url: ModelCheckpoints;
    _temperature: number;
    _helpText: Phaser.GameObjects.Text;
    _midi_drums: number[];
    _reverse_midi_mapping: Map<number, number>;
    _drum_seed: mm.INoteSequence;
    _melody_seed: mm.INoteSequence;
    constructor(Model: ModelCheckpoints, _helpText?: Phaser.GameObjects.Text);
    setTempo(tempo?: number): void;
    setTempurature(temp: number): void;
    setupModel(): Promise<void>;
    sampleModel(num: number, proj?: string[]): Promise<void>;
    private _onPlayerStart;
    private _onPlayerStop;
    start(): void;
    stop(): void;
    generateNewDrumPart(seed: any, length?: number): Promise<any>;
    toNoteSequence(pattern: any): any;
    fromNoteSequence(seq: any, patternLength: any): any;
}
