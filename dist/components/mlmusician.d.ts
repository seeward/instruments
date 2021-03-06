import * as mm from '@magenta/music/es5';
export declare enum ModelCheckpoints {
    MelodyRNN = "https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/melody_rnn",
    MelodywithChordsRNN = "https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv",
    DrumRNN = "https://storage.googleapis.com/download.magenta.tensorflow.org/tfjs_checkpoints/music_rnn/drum_kit_rnn",
    ChordImprov = "https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv",
    BasicRNN = "https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn",
    ImprovRNN = "https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv",
    MelodyVAE = "https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_4bar_small_q2"
}
export declare enum MLModels {
    RNN = 1,
    VAE = 2,
    DDSP = 3,
    COCONET = 4,
    GANSYNTH = 5,
    PIANOGENIE = 6
}
export declare enum WorkerStates {
    init = 1,
    waiting = 2,
    working = 3
}
export interface IRecorderConfig {
    playClick: boolean;
    qpm: number;
    playCountIn: boolean;
    startRecordingAtFirstNote: boolean;
}
export default class MachineMusicMan {
    _player: mm.Player;
    _melody_converter: mm.data.MelodyConverter;
    _recorder: mm.Recorder;
    _recorded_seq: mm.INoteSequence;
    _sampled_seq: mm.INoteSequence;
    _seq_model: mm.MusicRNN | mm.MusicVAE | mm.Coconet | mm.GANSynth | mm.DDSP | mm.PianoGenie;
    _model_url: ModelCheckpoints;
    _temperature: number;
    _helpText: Phaser.GameObjects.Text;
    _midi_drums: number[];
    _model_type: MLModels;
    _reverse_midi_mapping: Map<number, number>;
    _drum_seed: mm.INoteSequence;
    _melody_seed: mm.INoteSequence;
    _logText: Phaser.GameObjects.Text;
    constructor(Model: MLModels, ModelURL: ModelCheckpoints, _helpText?: Phaser.GameObjects.Text, _logText?: Phaser.GameObjects.Text);
    resolveModelText(type: MLModels): "RNN Neural Model" | "VAE Neural Model";
    setTempo(tempo?: number): void;
    initRecorder(opts?: IRecorderConfig): Promise<void>;
    sendToWorker(msg: any): void;
    initWorker(): void;
    startRecorder(): void;
    stopRecorder(): Promise<void>;
    playbackRecording(bpm: number): void;
    setTempurature(temp: number): void;
    isInitialised(): boolean;
    setupModel(): Promise<void>;
    sampleModel(num: number, chords?: string[]): Promise<any>;
    getSimilarPattern(pattern: mm.INoteSequence, num?: number, similarity?: number): Promise<any>;
    continuePattern(pattern: mm.INoteSequence): Promise<any>;
    private _onPlayerStart;
    private _onPlayerStop;
    convertToTensor(): void;
    startPlayer(input: mm.INoteSequence, bpm?: number): void;
    stopPlayer(): void;
    generateNewDrumPart(seed: any, length?: number): Promise<any>;
    toNoteSequence(pattern: any): any;
    fromNoteSequence(seq: any, patternLength: any): any;
}
