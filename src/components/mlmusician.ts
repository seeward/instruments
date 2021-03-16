
import * as mm from '@magenta/music/es5'
import * as _ from 'lodash-es'
import { Transport } from 'tone';

export enum ModelCheckpoints {
  MelodyRNN = 'https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/melody_rnn',
  MelodywithChordsRNN = 'https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv',
  DrumRNN = 'https://storage.googleapis.com/download.magenta.tensorflow.org/tfjs_checkpoints/music_rnn/drum_kit_rnn',
  ChordImprov = 'https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv',
  BasicRNN = 'https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn' ,
  ImprovRNN = 'https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv',
  MelodyVAE = 'https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_4bar_small_q2'
}

export enum MLModels {
  RNN = 1,
  VAE = 2,
  DDSP = 3,
  COCONET = 4,
  GANSYNTH = 5,
  PIANOGENIE = 6
}


export enum WorkerStates {
  init = 1,
  waiting = 2,
  working = 3
}
export interface IRecorderConfig {
  playClick: boolean,
  qpm: number,
  playCountIn: boolean,
  startRecordingAtFirstNote: boolean
}
export default class MachineMusicMan {

  _player: mm.Player
  _melody_converter: mm.data.MelodyConverter
  public _recorder: mm.Recorder
  _recorded_seq: mm.INoteSequence
  _sampled_seq: mm.INoteSequence
  _seq_model: mm.MusicRNN | mm.MusicVAE | mm.Coconet | mm.GANSynth | mm.DDSP | mm.PianoGenie
  _model_url: ModelCheckpoints
  _temperature: number = 1.125
  _helpText: Phaser.GameObjects.Text;
  _midi_drums: number[] = [36, 38, 42, 46, 41, 43, 45, 49, 51];
  _model_type: MLModels;

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
  _logText: Phaser.GameObjects.Text;


  constructor(Model: MLModels, ModelURL: ModelCheckpoints, _helpText?: Phaser.GameObjects.Text, _logText?: Phaser.GameObjects.Text) {

    if(!ModelURL || !Model){
      throw new Error("ML MODEL OR URL NOT PROVIDED")
    }


    this._model_type = Model
    this._model_url = ModelURL
    this._helpText = _helpText
    this._logText = _logText

    this._player = new mm.Player(false, {
      stop: this._onPlayerStop,
      run: this._onPlayerStart
    });
    
    this.setupModel();
  }

  resolveModelText(type: MLModels){
    switch(type){
      case MLModels.RNN: 
        return 'RNN Neural Model';
        break
      case MLModels.VAE: 
        return 'VAE Neural Model'
        break
    }
  }

  public setTempo(tempo?: number) {
    this._player.setTempo(tempo);
  }
  public async initRecorder(opts?: IRecorderConfig){
    this._recorder = new mm.Recorder(opts ? opts : {startRecordingAtFirstNote: true, qpm: Transport.bpm.value});
    await this._recorder.initialize();
  }

  sendToWorker(msg:any){
    console.log(`sending: ${msg}`)

  }
  initWorker(){
    // Worker returns the result.
  
  this.sendToWorker({type: WorkerStates.init, notes:['C2', 'G4', 'A2', 'C5']})
  }
  public startRecorder(){
    if(!this._recorder.isRecording()){
      this._recorder.start();
    }
  }
  public async stopRecorder() {
    if(this._recorder.isRecording()){
      this._recorded_seq = this._recorder.stop();
      console.log(this._recorded_seq)
      //let newPattern = await this.getSimilarPattern(this._recorded_seq)
      let newPattern = await this.continuePattern(this._recorded_seq);
      console.log(newPattern)
      this._player.start(newPattern)
    }
  }
  public playbackRecording(bpm: number){
    if(!this._player.isPlaying()){
      this._player.start(this._recorded_seq, bpm ? bpm : Transport.bpm.value)
    }
  }
  public setTempurature(temp: number){
    this._temperature = temp
  }
  public isInitialised(){
    return this._seq_model.isInitialized()
  }
  async setupModel() {
    this._logText.setText(`Initialising ${this.resolveModelText(this._model_type)}`)
    switch(this._model_type){
      case MLModels.RNN: 
      this._seq_model = new mm.MusicRNN(this._model_url);
      this._melody_converter = new mm.data.MelodyConverter({maxPitch: 88, minPitch: 0})
      await this._seq_model.initialize()
      break;
      case MLModels.VAE: 
      this._seq_model = new mm.MusicVAE(this._model_url);
      await this._seq_model.initialize()
      break;

    }
    this._logText.setText(`${this.resolveModelText(this._model_type)} initialised`)
  }
  async sampleModel(num:number, chords?: string[]){

    if(this._model_type === MLModels.VAE && this._seq_model.isInitialized()){
      this._sampled_seq = await (this._seq_model as mm.MusicVAE).sample(num, this._temperature)
      return this._sampled_seq
    } else {
      return null
    }
   
  }
  async getSimilarPattern(pattern: mm.INoteSequence, num: number = 1, similarity: number = .75){
    if(this._model_type === MLModels.VAE && this._seq_model.isInitialized()){
      let qPattern = mm.sequences.quantizeNoteSequence(pattern, 4)
      console.log(qPattern)
      this._sampled_seq = await (this._seq_model as mm.MusicVAE).similar(qPattern, num, similarity, this._temperature)
      return this._sampled_seq
    } else {
      return this._melody_seed
    }
  }
  async continuePattern(pattern: mm.INoteSequence){
    if(this._model_type === MLModels.RNN && this._seq_model.isInitialized()){
      let qPattern = mm.sequences.quantizeNoteSequence(pattern, 4)
      console.log(qPattern)
      this._sampled_seq = await (this._seq_model as mm.MusicRNN).continueSequence(qPattern, 64, this._temperature)
      return this._sampled_seq
    }
  }
  private _onPlayerStart(note?: any) {
    //console.log(note)
  }

  private _onPlayerStop(note?: any) {
    // console.log(note)
  }

  public convertToTensor(){

  }

  public startPlayer(input: mm.INoteSequence, bpm?: number) {

    if (!this._player.isPlaying()) {
      this._player.start(input, bpm);
    }
    
  }

  public stopPlayer() {
    if(this._player.isPlaying()){
      this._player.stop();
    }
    
  }

  public async generateNewDrumPart(seed: any, length?: number) {
    this._logText.setText(`Generating drum pattern from ${this.resolveModelText(this._model_type)}`)
    if(this._model_type === MLModels.RNN){
      if(this._seq_model.isInitialized()){
        let seedSeq = this.toNoteSequence(seed);
  
        return (this._seq_model as mm.MusicRNN)
          .continueSequence(seedSeq, 16, this._temperature)
          .then(r =>{
            return this.fromNoteSequence(r, 16)
          })
          
      } else {
        this._logText.setText('ML Model not initialised.')
      }
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