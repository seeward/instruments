import { AMSynth, FMSynth, MembraneSynth, MonoSynth, NoiseSynth, DuoSynth } from 'tone';
import ApiService from '../helpers/apiService';
export declare enum SynthTypes {
    AMSynth = 1,
    FMSymth = 2,
    DuoSynth = 3,
    MembraneSynth = 4,
    MonoSynth = 5,
    NoiseSynth = 6
}
export interface SynthWrapper {
    _id: string;
    type: string;
    preset: string;
    synth: any | object;
}
export default class SynthManager extends Phaser.GameObjects.Container {
    _api: ApiService;
    _synths: any;
    _raw_synth_json: SynthWrapper[];
    _currentSynth: AMSynth | FMSynth | NoiseSynth | MembraneSynth | MonoSynth | DuoSynth;
    helpText: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, x: number, y: number, helpText?: Phaser.GameObjects.Text);
    getSavedSynths(): Promise<any>;
    getSynths(): Promise<any>;
    saveSynth(synth: any): Promise<Response>;
    getSynthPlayer(type: SynthTypes): AMSynth | FMSynth | NoiseSynth | MembraneSynth | MonoSynth | DuoSynth;
    convertStringToEnum(value: string): SynthTypes;
    setCurrentSynth(): AMSynth | FMSynth | NoiseSynth | MembraneSynth | MonoSynth | DuoSynth;
    initaliseSynths(): void;
    addSynthJSONControl(): void;
    addSynthList(): void;
    update(): void;
}
