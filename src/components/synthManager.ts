import { AMSynth, FMSynth, MembraneSynth, MonoSynth, NoiseSynth, Player, Synth, DuoSynth } from 'tone';
import { Tone } from 'tone/build/esm/core/Tone';
import ApiService from '../helpers/apiService'
import * as uiWidgets from 'phaser-ui-tools';

export enum SynthTypes {
    AMSynth = 1,
    FMSymth = 2,
    DuoSynth = 3,
    MembraneSynth = 4,
    MonoSynth = 5,
    NoiseSynth = 6
}

export interface SynthWrapper {
    _id: string
    type: string
    preset: string
    synth: any | object
}

export default class SynthManager extends Phaser.GameObjects.Container {

    _api: ApiService = new ApiService('//seeward-synth-manager.glitch.me');
    _synths: any = []
    _raw_synth_json: SynthWrapper[]
    _currentSynth: AMSynth | FMSynth | NoiseSynth | MembraneSynth | MonoSynth | DuoSynth
    helpText: Phaser.GameObjects.Text

    constructor(scene: Phaser.Scene, x: number, y: number, helpText?: Phaser.GameObjects.Text) {
        super(scene, x, y);
        this.helpText = helpText ? helpText : null
        this.getSavedSynths()
        // this.addSynthJSONControl()
    }

    async getSavedSynths() {
        let t = await this._api._get('/synths')
        this._raw_synth_json = await t.json() as SynthWrapper[];
        this.initaliseSynths();
        return this._synths
    }
    async getSynths(){
        return this._synths.length > 0 ? this._synths.reverse() : await this.getSavedSynths()
    }
    async saveSynth(synth: any) {
        return await this._api._post('/addSynth', synth)
    }
    getSynthPlayer(type: SynthTypes): AMSynth | FMSynth | NoiseSynth | MembraneSynth | MonoSynth | DuoSynth {
        switch (type) {
            case SynthTypes.AMSynth:
                return new AMSynth().toDestination()
                break
            case SynthTypes.DuoSynth:
                    return new DuoSynth().toDestination()
                    break
            case SynthTypes.FMSymth:
                return new FMSynth().toDestination()
                break
            case SynthTypes.MonoSynth:
                return new MonoSynth().toDestination()
                break
            case SynthTypes.MembraneSynth:
                return new MembraneSynth().toDestination()
                break
            case SynthTypes.NoiseSynth:
                return new NoiseSynth().toDestination()
                break
        }
    }
    convertStringToEnum(value: string): SynthTypes {
        switch (value) {
            case "FMSynth":
                return SynthTypes.FMSymth
                break
            case "DuoSynth":
                return SynthTypes.DuoSynth
                break
            case "AMSynth":
                return SynthTypes.AMSynth
                break
            case "MonoSynth":
                return SynthTypes.MonoSynth
                break
            case "NoiseSynth":
                return SynthTypes.NoiseSynth
                break
            case "MembraneSynth":
                return SynthTypes.MembraneSynth
                break

        }
    }
    setCurrentSynth(): AMSynth | FMSynth | NoiseSynth | MembraneSynth | MonoSynth | DuoSynth {
        return this._currentSynth
    }
    initaliseSynths() {
        this._raw_synth_json.forEach((eachSynth: SynthWrapper) => {
            console.log(`Init: ${eachSynth.type}`)
            
            
            if(eachSynth.type !== undefined){
                let ty = this.convertStringToEnum(eachSynth.type)
                let pl = this.getSynthPlayer(ty)
                pl.set(eachSynth.synth)
                this._synths.push(pl)
            }
            
        })
    }
    addSynthJSONControl() {
        console.log('into')
        var element = this.scene.add.dom(10, 10).createFromCache('synthinput');
        console.log(element)
        element.addListener('click');
        element.on('click', function (event) {
            console.log(event)
            if (event.target.name === 'save') {
                var inputText = this.getChildByName('synthinput');

                //  Have they entered anything?
                if (inputText.value !== '') {
                    //  Turn off the click events
                    this.removeListener('click');

                    //  Hide the login element
                    this.setVisible(false);

                    //  Populate the text with whatever they typed in
                    console.log(inputText)
                }

            }


        });
    }
    addSynthList() {

    }
    update() {

    }
}