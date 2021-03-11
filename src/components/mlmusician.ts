
import * as mm from '@magenta/music/es5'
import * as _ from 'lodash-es'
import {  Transport } from 'tone';

export enum ModelCheckpoints {
  DrumRNN = 'https://storage.googleapis.com/download.magenta.tensorflow.org/tfjs_checkpoints/music_rnn/drum_kit_rnn',
  ChordImprov = 'https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv',
  BasicRNN = 'https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn' ,
  ImprovRNN = 'https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv',
  MelodyVAE = 'https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_4bar_small_q2'
}
export default class MachineMusicMan {

  _player: mm.Player
  _seq_model: mm.MusicRNN | mm.MusicVAE | mm.Coconet
  _model_url: ModelCheckpoints
  _temperature: number = 1.4
  _helpText: Phaser.GameObjects.Text;
  _midi_drums: number[] = [36, 38, 42, 46, 41, 43, 45, 49, 51];

  _reverse_midi_mapping: Map<number, number> = new Map([
    [36, 0],
    [35, 0],
    [38, 1],
    [27, 1],
    [28, 1],
    [31, 1],
    [32, 1],
    [33, 1],
    [34, 1],
    [37, 1],
    [39, 1],
    [40, 1],
    [56, 1],
    [65, 1],
    [66, 1],
    [75, 1],
    [85, 1],
    [42, 2],
    [44, 2],
    [54, 2],
    [68, 2],
    [69, 2],
    [70, 2],
    [71, 2],
    [73, 2],
    [78, 2],
    [80, 2],
    [46, 3],
    [67, 3],
    [72, 3],
    [74, 3],
    [79, 3],
    [81, 3],
    [45, 4],
    [29, 4],
    [41, 4],
    [61, 4],
    [64, 4],
    [84, 4],
    [48, 5],
    [47, 5],
    [60, 5],
    [63, 5],
    [77, 5],
    [86, 5],
    [87, 5],
    [50, 6],
    [30, 6],
    [43, 6],
    [62, 6],
    [76, 6],
    [83, 6],
    [49, 7],
    [55, 7],
    [57, 7],
    [58, 7],
    [51, 8],
    [52, 8],
    [53, 8],
    [59, 8],
    [82, 8]
  ]);
  _drum_seed: mm.INoteSequence = {
    notes: [
      { pitch: 36, quantizedStartStep: 0, quantizedEndStep: 1, isDrum: true },
      { pitch: 38, quantizedStartStep: 0, quantizedEndStep: 1, isDrum: true },
      { pitch: 42, quantizedStartStep: 0, quantizedEndStep: 1, isDrum: true },
      { pitch: 46, quantizedStartStep: 0, quantizedEndStep: 1, isDrum: true },
      { pitch: 42, quantizedStartStep: 2, quantizedEndStep: 3, isDrum: true },
      { pitch: 42, quantizedStartStep: 3, quantizedEndStep: 4, isDrum: true },
      { pitch: 42, quantizedStartStep: 4, quantizedEndStep: 5, isDrum: true },
      { pitch: 50, quantizedStartStep: 4, quantizedEndStep: 5, isDrum: true },
      { pitch: 36, quantizedStartStep: 6, quantizedEndStep: 7, isDrum: true },
      { pitch: 38, quantizedStartStep: 6, quantizedEndStep: 7, isDrum: true },
      { pitch: 42, quantizedStartStep: 6, quantizedEndStep: 7, isDrum: true },
      { pitch: 45, quantizedStartStep: 6, quantizedEndStep: 7, isDrum: true },
      { pitch: 36, quantizedStartStep: 8, quantizedEndStep: 9, isDrum: true },
      { pitch: 42, quantizedStartStep: 8, quantizedEndStep: 9, isDrum: true },
      { pitch: 46, quantizedStartStep: 8, quantizedEndStep: 9, isDrum: true },
      { pitch: 42, quantizedStartStep: 10, quantizedEndStep: 11, isDrum: true },
      { pitch: 48, quantizedStartStep: 10, quantizedEndStep: 11, isDrum: true },
      { pitch: 50, quantizedStartStep: 10, quantizedEndStep: 11, isDrum: true },
    ],
    quantizationInfo: { stepsPerQuarter: 4 },
    tempos: [{ time: 0, qpm: 120 }],
    totalQuantizedSteps: 11
  };
  _melody_seed: mm.INoteSequence = {
    ticksPerQuarter: 220,
    totalTime: 28.5,
    timeSignatures: [
      {
        time: 0,
        numerator: 4,
        denominator: 4
      }
    ],
    tempos: [
      {
        time: 0,
        qpm: 120
      }
    ],
    notes: [
      { pitch: 'Gb4', startTime: 0, endTime: 1 },
      { pitch: 'F4', startTime: 1, endTime: 3.5 },
      { pitch: 'Ab4', startTime: 3.5, endTime: 4 },
      { pitch: 'C5', startTime: 4, endTime: 4.5 },
      { pitch: 'Eb5', startTime: 4.5, endTime: 5 },
      { pitch: 'Gb5', startTime: 5, endTime: 6 },
      { pitch: 'F5', startTime: 6, endTime: 7 },
      { pitch: 'E5', startTime: 7, endTime: 8 },
      { pitch: 'Eb5', startTime: 8, endTime: 8.5 },
      { pitch: 'C5', startTime: 8.5, endTime: 9 },
      { pitch: 'G4', startTime: 9, endTime: 11.5 },
      { pitch: 'F4', startTime: 11.5, endTime: 12 },
      { pitch: 'Ab4', startTime: 12, endTime: 12.5 },
      { pitch: 'C5', startTime: 12.5, endTime: 13 },
      { pitch: 'Eb5', startTime: 13, endTime: 14 },
      { pitch: 'D5', startTime: 14, endTime: 15 },
      { pitch: 'Db5', startTime: 15, endTime: 16 },
      { pitch: 'C5', startTime: 16, endTime: 16.5 },
      { pitch: 'F5', startTime: 16.5, endTime: 17 },
      { pitch: 'F4', startTime: 17, endTime: 19.5 },
      { pitch: 'G4', startTime: 19.5, endTime: 20 },
      { pitch: 'Ab4', startTime: 20, endTime: 20.5 },
      { pitch: 'C5', startTime: 20.5, endTime: 21 },
      { pitch: 'Eb5', startTime: 21, endTime: 21.5 },
      { pitch: 'C5', startTime: 21.5, endTime: 22 },
      { pitch: 'Eb5', startTime: 22, endTime: 22.5 },
      { pitch: 'C5', startTime: 22.5, endTime: 24.5 },
      { pitch: 'Eb5', startTime: 24.5, endTime: 25.5 },
      { pitch: 'G4', startTime: 25.5, endTime: 28.5 }
    ]
  }



  constructor(Model: ModelCheckpoints, _helpText?: Phaser.GameObjects.Text) {
    if(!Model){
      throw new Error("ML MODEL URL NOT PROVIDED")
    }
    this._model_url = Model
    this._helpText = _helpText

    this._player = new mm.Player(false, {
      stop: this._onPlayerStop,
      run: this._onPlayerStart
    });

    this.setupModel();
  }

  /**
   * setTempo
   * tempo: number    
   */
  public setTempo(tempo?: number) {
    this._player.setTempo(tempo);
  }

  public setTempurature(temp: number){
    this._temperature = temp
  }

  async setupModel() {
    this._seq_model = new mm.MusicVAE(this._model_url);
    this._helpText.setText('Initialising ML Model')
    await this._seq_model.initialize()
    this._helpText.setText('AI Model Initialized')
    setInterval(async ()=>{
      await this.sampleModel(1)
    }, 5000)
    
  }

  async sampleModel(num:number, proj?: string[]){
    let sample = await (this._seq_model as mm.MusicVAE).sample(num, this._temperature)
    if(!this._player.isPlaying()){
      console.log(sample[0].notes)
      this._player.start(sample[0], Transport.bpm.value);
    }
    
  }
  private _onPlayerStart(note?: any) {
    //console.log(note)
  }

  private _onPlayerStop(note?: any) {
    console.log(note)
  }

  /**
   * start the player
   */
  public start() {
    if (this._player.isPlaying()) {
      this._player.stop();
      return;
    }
    this._player.start(this._drum_seed);
  }
  /**
   * stop the player
   */
  public stop() {
    this._player.stop();
  }

  /**
   * generateNewDrumPart()
   */
  public async generateNewDrumPart(seed: any, length?: number) {
    if(this._seq_model.isInitialized){
      seed = seed
      console.log(JSON.stringify(seed))
      let seedSeq = this.toNoteSequence(seed);
      console.log(seedSeq)
      
      return (this._seq_model as mm.MusicRNN)
        .continueSequence(seedSeq, 16, this._temperature)
        .then(r =>{
          return this.fromNoteSequence(r, 16)
          // console.log(r)
          // console.log(this.fromNoteSequence(r, 16))
        })
    } else {
      return null
    }
    
  }


  toNoteSequence(pattern) {
    let self = this

    let _notes = _.flatMap(pattern, (step, index) =>
    step.map(d => ({
      pitch: self._midi_drums[d],
      startTime: index * 0.5,
      endTime: (index + 1) * 0.5
    }))
  )

  
    return mm.sequences.quantizeNoteSequence(
      {
        ticksPerQuarter: 220,
        totalTime: pattern.length / 2,
        timeSignatures: [
          {
            time: 0,
            numerator: 4,
            denominator: 4
          }
        ],
        tempos: [
          {
            time: 0,
            qpm: 120
          }
        ],
        notes: _notes
      },
      1
    );
  }

  fromNoteSequence(seq, patternLength) {
    console.log(seq)
    let res =  _.times(patternLength, () => []);
    for (let { pitch, quantizedStartStep } of seq.notes) {
      // console.log(pitch, this._reverse_midi_mapping.get(pitch))
      res[quantizedStartStep].push(this._reverse_midi_mapping.get(pitch));
    }
    return res;
  }




}