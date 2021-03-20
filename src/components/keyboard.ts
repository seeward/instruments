import { AmplitudeEnvelope, AMSynth, Chorus, Delay, Distortion, Envelope, Filter, FMSynth, MembraneSynth, MonoSynth, now, PingPongDelay, PluckSynth, PolySynth, Reverb, Transport } from 'tone';
import 'phaser';
import { generateColor } from '../helpers/PhaserHelpers';
import Metronome from './metronome';
import CustomRecorder from './recorder';
import 'webmidi';
import 'navigator';
import { mapRanges } from '../helpers/PhaserHelpers'
import SynthManager from './synthManager'
import Drums from './sampler';
import MachineMusicMan, { MLModels, ModelCheckpoints } from './mlmusician';
export default class KeyBoard extends Phaser.GameObjects.Container {

  _scales_: any[]
  _ml_pattern_generator: MachineMusicMan
  synth: PluckSynth | PolySynth | FMSynth | AMSynth | MembraneSynth
  synths: any[] = []
  currentSynthIndex: number = 0
  scales: string[] = ["Cmaj / Amin", "Emaj / C#min", "Gmaj / Emin", "Amaj / F#min", "Dmin / Fmaj"]
  soundSwitcher: Phaser.GameObjects.Ellipse
  recorder: CustomRecorder
  effect: Delay | PingPongDelay | Distortion | Filter | Chorus
  volumeLine: Phaser.GameObjects.Rectangle
  volumeSlide: Phaser.GameObjects.Ellipse
  effectStick: Phaser.GameObjects.Rectangle
  effectBG: Phaser.GameObjects.Rectangle
  effectBGInner: Phaser.GameObjects.Rectangle
  dist: Distortion
  delayControl: Phaser.GameObjects.Ellipse
  effectStickInner: Phaser.GameObjects.Ellipse
  distControl: Phaser.GameObjects.Ellipse
  effectConnectFlag: boolean = false
  distConnectFlag: boolean = false
  metronome: Metronome
  scaleIndex: number = 0
  tooltip: Phaser.GameObjects.Text;
  noteLength: any | number | string = '8n';
  eighth: Phaser.GameObjects.Rectangle
  quarter: Phaser.GameObjects.Rectangle
  half: Phaser.GameObjects.Rectangle
  whole: Phaser.GameObjects.Rectangle
  lengthSelector: Phaser.GameObjects.Ellipse
  makeBubbles: boolean = false;
  bubbleControl: Phaser.GameObjects.Ellipse;
  synthManager: SynthManager
  drums: Drums;
  helpText: Phaser.GameObjects.Text
  logText: Phaser.GameObjects.Text;
  scalesBtn: Phaser.GameObjects.Rectangle;
  showingScales: boolean = false;
  savedCards: any = {};
  savedText: any = {};
  envBG: Phaser.GameObjects.Rectangle;
  env: Envelope;
  envBGShadow: Phaser.GameObjects.Rectangle;
  muteEnv: Phaser.GameObjects.Rectangle;
  envOn: boolean = false;
  attack: Phaser.GameObjects.Rectangle;
  release: Phaser.GameObjects.Rectangle;
  decay: Phaser.GameObjects.Rectangle;
  sustain: Phaser.GameObjects.Rectangle;


  constructor(scene: Phaser.Scene, x: number, y: number, recorder?: CustomRecorder, effect?: Delay | PingPongDelay | Distortion | Filter | Chorus, synth?: PolySynth | FMSynth | MembraneSynth | AMSynth, helpText?: Phaser.GameObjects.Text, logText?: Phaser.GameObjects.Text) {
    super(scene, x, y);
    this.helpText = helpText ? helpText : null
    this.logText = logText ? logText : null
    this.synthManager = new SynthManager(this.scene, 0, 0, this.helpText);
    this.scene.add.existing(this);
    this._scales_ = [

      [
        "C4",
        "D4",
        "E4",
        "F4",
        "G4",
        "A4",
        "B4",
        "C5",
        "D5",
        "E5",
        "F5",
        "G5",
        "A5",
        "B5",
        "C6"
      ],
      [
        "E4",
        "F#4",
        "G4",
        "A4",
        "B4",
        "C#5",
        "D#5",
        "E5",
        "F#5",
        "G5",
        "A5",
        "B5",
        "C#6",
        "D#6",
        "E6"
      ],
      [
        "G4",
        "A4",
        "B4",
        "C5",
        "D5",
        "E5",
        "F#5",
        "G5",
        "A5",
        "B5",
        "C6",
        "D6",
        "E6",
        "F#6",
        "G6"
      ],
      [
        "A4",
        "B4",
        "C#5",
        "D5",
        "E5",
        "F#5",
        "G#5",
        "A5",
        "B5",
        "C#6",
        "D6",
        "E6",
        "F#6",
        "G#6",
        "A6"
      ],
      [
        "D4",
        "E4",
        "F4",
        "G4",
        "A4",
        "A#4",
        "C5",
        "D5",
        "E5",
        "F5",
        "G5",
        "A5",
        "A#5",
        "C6",
        "D6"
      ]

    ];

    let self = this;
    document.addEventListener("midiinput", function (event: any) {
      self.getMIDIMessage(event.detail);
    });

    if (recorder) {
      this.recorder = recorder
    }

    this._ml_pattern_generator = new MachineMusicMan(MLModels.RNN, ModelCheckpoints.MelodyRNN, this.helpText, logText)
    this._ml_pattern_generator.initRecorder();
    let defaultSynth = synth ? synth : new FMSynth().toDestination()
    this.synths.push(defaultSynth);
    this.env = new Envelope({
      attack: 0.1,
      decay: 0.2,
      sustain: 1.0,
      release: 0.8
    }).toDestination();

    this.initSynths();
    this.addVolumeControls();
    this.addNoteLengthControls()
    this.addMetronome();
    this.addBubbleControl();
    this.addToneControls();
    this.createEnvelopControls();
    this.createKeyboardControls(this);

  }

  async initSynths() {
    if (this.synthManager) {
      let ss = await this.synthManager.getSynths()
      this.synths = ss
      this.synth = ss[0];

    } else {
      this.synths.push(new FMSynth().toDestination(), new PluckSynth({ dampening: 1000, attackNoise: 2, release: 750 }).toDestination(), new MembraneSynth({ volume: -10 }).toDestination())

    }
  }
  getSynth() {
    return this.synth
  }
  async createAIPatterns() {
    this.logText.setText('Generating AI melody pattern')
    let newPatten = await this._ml_pattern_generator.sampleModel(1);
    console.log(newPatten)
    setInterval(() => {
      this._ml_pattern_generator.startPlayer(newPatten[0], Transport.bpm.value);
    }, 5000)
  }
  public playSequence(seq: { notes: any[] }) {
    console.log(seq)
    // let t = seq.notes.map((note)=>{ return this.noteMidiToString(note.pitch)})
    // console.log(t)
    // let p = new Sequence((time,value)=>{

    //   this.synth.triggerAttackRelease(this.noteMidiToString(value), '16n', time)

    // },t).start(0)



  }
  addNoteLengthControls() {


    this.eighth = this.scene.add.rectangle(this.x - 15, this.y + 30, 10, 10, generateColor(), .5)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(1, 0x000000, .7).setDepth(1)
      .on('pointerover', () => {
        this.eighth.setAlpha(1)
        this.helpText.setText("1/8 note")
      })
      .on('pointerout', () => {
        this.eighth.setAlpha(.5)
        this.helpText.setText("")
      })
      .on('pointerdown', () => {
        this.noteLength = '8n'
        this.lengthSelector.setX(this.eighth.x)
        this.lengthSelector.setY(this.eighth.y)
      })

    this.lengthSelector = this.scene.add.ellipse(this.eighth.x, this.eighth.y, 12, 12, 0xff0000, .25)
      .setStrokeStyle(2, 0x000000, 1).setDepth(1)


    this.quarter = this.scene.add.rectangle(this.x - 15, this.y + 45, 10, 10, generateColor(), .5)
      .setInteractive({ useHandCursor: true }).setDepth(1)
      .on('pointerover', () => {
        this.quarter.setAlpha(1)
        this.helpText.setText("1/4 note")
      }).setStrokeStyle(1, 0x000000, .7)
      .on('pointerout', () => {
        this.quarter.setAlpha(.5)
        this.helpText.setText("")
      })
      .on('pointerdown', () => {
        this.lengthSelector.setX(this.quarter.x)
        this.lengthSelector.setY(this.quarter.y)
        this.noteLength = '4n'
      })

    this.half = this.scene.add.rectangle(this.x - 15, this.y + 60, 10, 10, generateColor(), .5)
      .setInteractive({ useHandCursor: true }).setDepth(1)
      .on('pointerover', () => {
        this.half.setAlpha(1)
        this.helpText.setText("1/2 note")
      }).setStrokeStyle(1, 0x000000, .7)
      .on('pointerout', () => {
        this.half.setAlpha(.5)
        this.helpText.setText("")
      })
      .on('pointerdown', () => {
        this.lengthSelector.setX(this.half.x)
        this.lengthSelector.setY(this.half.y)
        this.noteLength = '2n'
      })

    this.whole = this.scene.add.rectangle(this.x - 15, this.y + 75, 10, 10, generateColor(), .5)
      .setInteractive({ useHandCursor: true }).setDepth(1)
      .on('pointerover', () => {
        this.whole.setAlpha(1)
        this.helpText.setText("Whole note")
      }).setStrokeStyle(1, 0x000000, .7)
      .on('pointerout', () => {
        this.whole.setAlpha(.5)
        this.helpText.setText("")
      })
      .on('pointerdown', () => {
        this.lengthSelector.setX(this.whole.x)
        this.lengthSelector.setY(this.whole.y)
        this.noteLength = '1n'
      })

  }
  convertXtoVolume(x: number): number {

    return Math.floor((x / 10 * -1))
  }
  addMetronome() {
    // nome = new Metronome(this.scene, this.effectBG.x + this.effectBG.width, this.effectBG.y, 110, 25, 100)
  }
  getMIDIMessage(midiMessage) {
    var self = this
    //console.log(midiMessage);
    // midiMessage = midiMessage.split(',')
    var command = midiMessage[0];
    var note = midiMessage[1];
    var velocity = midiMessage.length > 2 ? midiMessage[2] : 0;

    this.playMidiNote(self, {
      com: command,
      note: note,
      velocity: velocity
    });
  }
  connectEnvelop() {
    this.envOn = true
  }
  createEnvelopControls() {

    this.envBGShadow = this.scene.add.rectangle(this.x + 608, this.y + 3, 75, 130, 0x000000, .5)
      .setOrigin(0).setDepth(3)
    this.envBG = this.scene.add.rectangle(this.x + 605, this.y, 75, 130, generateColor(), 1)
      .setOrigin(0).setDepth(3).setStrokeStyle(1, 0x000000, .5)

    
    this.attack = this.scene.add.rectangle(this.x + 615, this.y + 10, 10, 20, 0x000000, 1)
      .setOrigin(0).setDepth(3).setInteractive({ useHandCursor: true, draggable: true }).setStrokeStyle(2, 0x000000, 1)
      .on('drag', (pointer: any, gameObject: Phaser.GameObjects.Rectangle, dragY: number, dragX: number) => {

        let adjustedX = Math.floor(pointer.x - this.x)
        console.log(adjustedX);
        if (adjustedX > 661) {
          adjustedX = 661
        }
        if (adjustedX < 615) {
          adjustedX = 615
        }
        let Y = mapRanges(adjustedX, 615, 661, .001, 1)
        this.helpText.setText(`Envelope: Attack: ${Y.toFixed(2)}`);
        this.synth.set({ envelope: { attack: Y } });
        this.attack.setX(adjustedX + this.x)
      })
      .on('pointerover', () => {
        this.helpText.setText('Attack')
      })
      .on('pointerout', () => {
        this.helpText.setText('')
      })
      let line1 = this.scene.add.rectangle(this.attack.x, this.attack.y + (this.attack.height / 2) - 2, 55, 3, 0x000000, .5).setOrigin(0).setDepth(3)

    this.release = this.scene.add.rectangle(this.x + 615, this.y + 40, 10, 20, 0x000000, 1)
      .setOrigin(0).setDepth(3).setInteractive({ useHandCursor: true, draggable: true }).setStrokeStyle(2, 0x000000, 1)
      .on('drag', (pointer: any, gameObject: Phaser.GameObjects.Rectangle, dragY: number, dragX: number) => {

        let adjustedX = Math.floor(pointer.x - this.x)
        console.log(adjustedX);
        if (adjustedX > 661) {
          adjustedX = 661
        }
        if (adjustedX < 615) {
          adjustedX = 615
        }
        let Y = mapRanges(adjustedX, 615, 661, 0, 5)
        this.helpText.setText(`Envelope: Release: ${Y.toFixed(2)}`);
        this.synth.set({ envelope: { release: Y } });
        this.release.setX(adjustedX + this.x)
      })
      .on('pointerover', () => {
        this.helpText.setText('Release')
      })
      .on('pointerout', () => {
        this.helpText.setText('')
      })
      let line2 = this.scene.add.rectangle(this.release.x, this.release.y + (this.release.height / 2) - 2, 55, 3, 0x000000, .5).setOrigin(0).setDepth(3)

    this.decay = this.scene.add.rectangle(this.x + 615, this.y + 70, 10, 20, 0x000000, 1)
      .setOrigin(0).setDepth(3).setInteractive({ useHandCursor: true, draggable: true }).setStrokeStyle(2, 0x000000, 1)
      .on('drag', (pointer: any, gameObject: Phaser.GameObjects.Rectangle, dragY: number, dragX: number) => {

        let adjustedX = Math.floor(pointer.x - this.x)
        console.log(adjustedX);
        if (adjustedX > 661) {
          adjustedX = 661
        }
        if (adjustedX < 615) {
          adjustedX = 615
        }
        let Y = mapRanges(adjustedX, 615, 661, .1, .9)
        this.helpText.setText(`Envelope: Decay: ${Y.toFixed(2)}`);
        this.synth.set({ envelope: { decay: Y } });
        this.decay.setX(adjustedX + this.x)
      })
      .on('pointerover', () => {
        this.helpText.setText('Decay')
      })
      .on('pointerout', () => {
        this.helpText.setText('')
      })
      let line3 = this.scene.add.rectangle(this.decay.x, this.decay.y + (this.decay.height / 2) - 2, 55, 3, 0x000000, .5).setOrigin(0).setDepth(3)

    this.sustain = this.scene.add.rectangle(this.x + 615, this.y + 100, 10, 20, 0x000000, 1)
      .setOrigin(0).setDepth(3).setInteractive({ useHandCursor: true, draggable: true }).setStrokeStyle(2, 0x000000, 1)
      .on('drag', (pointer: any, gameObject: Phaser.GameObjects.Rectangle, dragY: number, dragX: number) => {

        let adjustedX = Math.floor(pointer.x - this.x)
        console.log(adjustedX);
        if (adjustedX > 661) {
          adjustedX = 661
        }
        if (adjustedX < 615) {
          adjustedX = 615
        }
        let Y = mapRanges(adjustedX, 615, 661, 0, 1)
        this.helpText.setText(`Envelope: Sustain: ${Y.toFixed(2)}`);
        this.synth.set({ envelope: { sustain: Y } });
        this.sustain.setX(adjustedX + this.x)
      })
      .on('pointerover', () => {
        this.helpText.setText('Sustain')
      })
      .on('pointerout', () => {
        this.helpText.setText('')
      })
      let line4 = this.scene.add.rectangle(this.sustain.x, this.sustain.y + (this.sustain.height / 2) - 2, 55, 3, 0x000000, .5).setOrigin(0).setDepth(3)

  }
  disconnectEnvelope() {
    this.synth.disconnect(this.env)
    this.envOn = false
  }
  setNewScale(num: number) {
    this.scaleIndex = num;
    console.log(this._scales_[this.scaleIndex])
  }
  noteMidiToString(n) {
    const noteName = [
      "C",
      "C#",
      "D",
      "D#",
      "E",
      "F",
      "F#",
      "G",
      "G#",
      "A",
      "A#",
      "B"
    ];
    const oct = Math.floor(n / 12) - 1;
    const note = n % 12;
    return noteName[note] + oct;
  }
  playMidiNote(t, noteObject) {
    console.log(noteObject)
    // console.log(noteObject)
    if (noteObject.com == 146) {
      // console.log(this.noteMidiToString(noteObject.note))
      // noteOn
      let self = this
      this.logText.setText(`${noteObject.note} triggered`)
      this.synth.triggerAttackRelease(
        self.noteMidiToString(noteObject.note), this.noteLength, Transport.immediate()
      );


    } else if (noteObject.com === 130) {
      // noteOff
      // console.log(this.noteMidiToString(noteObject))
      // this.synth.triggerRelease(
      //   this.noteMidiToString(noteObject.note)
      // );
    }
  }
  addVolumeControls() {
    this.volumeLine = this.scene.add.rectangle(this.x, this.y, 600, 5, 0x000000, .25).setOrigin(0).setDepth(1)
    this.volumeSlide = this.scene.add.ellipse(this.x - 12.5, this.y - 10, 25, 25, generateColor(), 1).setStrokeStyle(2, 0x000000, .5).setDepth(3)
      .setOrigin(0).setInteractive({ useHandCursor: true, draggable: true })
      .on('pointerover', () => { this.volumeSlide.setFillStyle(generateColor(), 1); this.helpText.setText("KEYS GAIN") })
      .on('pointerout', () => { this.volumeSlide.setFillStyle(generateColor(), 1); this.helpText.setText("") })
      .on('drag', (pointer: any, gameObject: Phaser.GameObjects.Rectangle, dragY: number, dragX: number) => {
        this.volumeSlide.x = pointer.position.x
        let adjustedX = this.convertXtoVolume(this.volumeSlide.x - this.x)
        //console.log(adjustedX);
        if (adjustedX > 20) {
          adjustedX = 20
        }
        if (adjustedX < -90) {
          adjustedX = -90
        }
        this.helpText.setText(`KEYS GAIN: ${adjustedX} db`)
        this.synth.set({ volume: adjustedX })
      })

    this.scalesBtn = this.scene.add.rectangle(this.x + 30, this.y - 15, 20, 10, generateColor())
      .setDepth(2).setOrigin(0).setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0x000000, 1)
      .on('pointerdown', () => {
        if (!this.showingScales) {
          this.showingScales = true
          if (this.scales.length > 0) {
            this.savedCards['holder'] = this.scene.add.rectangle(this.scalesBtn.x + 20, this.scalesBtn.y - 100, 100, this.scales.length * 25, generateColor(), 1)
              .setStrokeStyle(3, 0x000000, 1)
              .setDepth(3).setOrigin(0)
            let ySpace = 0;
            this.scales.forEach((eachPattern, i) => {
              console.log(eachPattern)
              this.savedCards[i] = this.scene.add.rectangle(this.scalesBtn.x + 20, (this.scalesBtn.y - 100) + ySpace, 100, 25, 0x000000, .5)
                .setDepth(3).setOrigin(0).setInteractive({ useHandCursor: true })
                .on('pointerover', () => {
                  this.savedCards[i].setFillStyle(0x000000, 1)
                })
                .on('pointerout', () => {
                  this.savedCards[i].setFillStyle(0x000000, .5)

                })
                .on('pointerdown', () => {
                  this.setNewScale(i)
                  this.showingScales = false
                  this.savedCards[i].setFillStyle(0xc1c1c1, 1)

                  Object.keys(this.savedCards).forEach((eachCard) => {
                    this.savedCards[eachCard].destroy()
                  })

                  Object.keys(this.savedText).forEach((eachText) => {
                    this.savedText[eachText].destroy()
                  })


                })

              this.savedText[i] = this.scene.add.text(this.savedCards[i].x + 5, this.savedCards[i].y + 5, eachPattern, { fontSize: '12px', color: '#ffffff' }).setDepth(3).setOrigin(0)

              ySpace += 25

            })
          }



        } else {
          this.showingScales = false

          Object.keys(this.savedCards).forEach((eachCard) => {
            this.savedCards[eachCard].destroy()
          })

          Object.keys(this.savedText).forEach((eachText) => {
            this.savedText[eachText].destroy()
          })
        }


      })
      .on('pointerover', () => {
        this.helpText.setText("Change Keyboard Scale");
      })
      .on('pointerout', () => {
        this.helpText.setText("")
      })
  }

  addToneControls() {
    this.soundSwitcher = this.scene.add.ellipse(this.x, this.y + 200, 40, 40, generateColor(), 1).setInteractive({ useHandCursor: true })
      .on('pointerover', () => { this.soundSwitcher.setAlpha(1); this.helpText.setText(`TONE: ${this.synth.name}`) }).setStrokeStyle(2, 0x000000, .5)
      .on('pointerout', () => { this.soundSwitcher.setAlpha(.75); this.helpText.setText("") }).setDepth(2)
      .on('pointerdown', () => {
        this.soundSwitcher.setFillStyle(generateColor(), 1)
        this.currentSynthIndex++
        if (this.currentSynthIndex === this.synths.length) {
          this.currentSynthIndex = 0
        }
        this.changeTone(this.synths[this.currentSynthIndex])
      })

  }
  changeTone(newtone: PluckSynth | PolySynth | FMSynth | AMSynth | MembraneSynth) {
    // if (this.effect && this.recorder) {
    //   newtone.chain(this.effect, this.dist, new Reverb(.5).toDestination(), this.recorder.getRecorder())
    // }
    this.helpText.setText(`TONE: ${newtone.name}`)
    this.synth = newtone
  }
  addBubbleControl() {
    this.bubbleControl = this.scene.add.ellipse(this.x - 15, this.y + 95, 15, 15, generateColor(), 1)
      .setInteractive({ useHandCursor: true }).setDepth(1)
      .on('pointerover', () => {
        this.bubbleControl.setScale(1.25)
      })
      .on('pointerout', () => {
        this.bubbleControl.setScale(1)
      })
      .on('pointerdown', async () => {
        this.makeBubbles = !this.makeBubbles

        //this._ml_pattern_generator._recorder.isRecording() ? this._ml_pattern_generator.stopRecorder() : this._ml_pattern_generator.startRecorder()
        // await this.createAIPatterns();
      })
    setInterval(() => { this.bubbleControl.setFillStyle(generateColor()) }, 750)
  }
  makeBubble(x: number, y: number) {
    if (this.makeBubbles) {
      let rand = Math.floor(Phaser.Math.Between(1, 3))
      let text = rand == 1 ? 'bubble' : rand == 2 ? 'bubble2' : 'bubble3'
      let t = this.scene.physics.add.sprite(x + 10, y - 10, text).setDepth(1)
        .setVelocityY(Phaser.Math.Between(-200, 200))
        .setCollideWorldBounds(true)
        .setVelocityX(Phaser.Math.Between(-100, 100))
        .setBounce(.5).setDepth(0).setTintFill(generateColor())
      setTimeout(() => { t.destroy() }, 5000)
    }

  }
  createKeyboardControls(t) {

    let keysArray = {};
    keysArray[0] = this.scene.add
      .rectangle(t.x, t.y, 40, 200, generateColor())
      .setOrigin(0)
      .setAlpha(0.5)
      .setDepth(1)
      .setStrokeStyle(1, 0x000000, 1)
      .setInteractive({ useHandCursor: true })
      .on(
        "pointerover",
        () => {

          this.makeBubble(keysArray[0].x, keysArray[0].y - 10)
          keysArray[0].setAlpha(1);
          console.log(this._scales_[t.scaleIndex][0])
          this.synth.triggerAttackRelease(this._scales_[t.scaleIndex][0], this.noteLength);
        },
        t
      )
      .on("pointerout", () => {
        keysArray[0].setAlpha(0.5);
      })


    keysArray[1] = this.scene.add
      .rectangle(t.x + 40, t.y, 40, 200, generateColor())
      .setOrigin(0).setStrokeStyle(1, 0x000000, 1)
      .setAlpha(0.5).setDepth(1)
      .setInteractive({ useHandCursor: true })
      .on(
        "pointerover",
        () => {
          this.makeBubble(keysArray[1].x, keysArray[1].y - 10)
          console.log(this._scales_[t.scaleIndex][1])
          keysArray[1].setAlpha(1);
          this.synth.triggerAttackRelease(this._scales_[this.scaleIndex][1], this.noteLength);
        },
        t
      )
      .on("pointerout", () => {
        keysArray[1].setAlpha(0.5);
      })


    keysArray[2] = this.scene.add
      .rectangle(t.x + 80, t.y, 40, 200, generateColor())
      .setOrigin(0).setStrokeStyle(1, 0x000000, 1)
      .setAlpha(0.5).setDepth(1)
      .setInteractive({ useHandCursor: true })
      .on(
        "pointerover",
        () => {
          this.makeBubble(keysArray[2].x, keysArray[2].y - 10)
          console.log(this._scales_[t.scaleIndex][2])
          keysArray[2].setAlpha(1);
          this.synth.triggerAttackRelease(this._scales_[this.scaleIndex][2], this.noteLength);
        },
        t
      )
      .on("pointerout", () => {
        keysArray[2].setAlpha(0.5);
      })


    keysArray[3] = this.scene.add
      .rectangle(t.x + 120, t.y, 40, 200, generateColor())
      .setOrigin(0).setStrokeStyle(1, 0x000000, 1)
      .setAlpha(0.5).setDepth(1)
      .setInteractive({ useHandCursor: true })
      .on(
        "pointerover",
        () => {
          this.makeBubble(keysArray[3].x, keysArray[3].y - 10)
          console.log(this._scales_[t.scaleIndex][3])
          keysArray[3].setAlpha(1);
          this.synth.triggerAttackRelease(this._scales_[this.scaleIndex][3], this.noteLength);
        },
        t
      )
      .on("pointerout", () => {
        keysArray[3].setAlpha(0.5);
      })

    keysArray[4] = this.scene.add
      .rectangle(t.x + 160, t.y, 40, 200, generateColor())
      .setOrigin(0).setStrokeStyle(1, 0x000000, 1)
      .setAlpha(0.5).setDepth(1)
      .setInteractive({ useHandCursor: true })
      .on(
        "pointerover",
        () => {
          this.makeBubble(keysArray[4].x, keysArray[4].y - 10)
          console.log(this._scales_[t.scaleIndex][4])
          keysArray[4].setAlpha(1);
          this.synth.triggerAttackRelease(this._scales_[this.scaleIndex][4], this.noteLength);
        },
        t
      )
      .on("pointerout", () => {
        keysArray[4].setAlpha(0.5);
      })


    keysArray[5] = this.scene.add
      .rectangle(t.x + 200, t.y, 40, 200, generateColor())
      .setOrigin(0).setStrokeStyle(1, 0x000000, 1)
      .setAlpha(0.5).setDepth(1)
      .setInteractive({ useHandCursor: true })
      .on(
        "pointerover",
        () => {
          this.makeBubble(keysArray[5].x, keysArray[5].y - 10)
          console.log(this._scales_[t.scaleIndex][5])
          keysArray[5].setAlpha(1);
          this.synth.triggerAttackRelease(this._scales_[this.scaleIndex][5], this.noteLength);
        },
        t
      )
      .on("pointerout", () => {
        keysArray[5].setAlpha(0.5);
      })


    keysArray[6] = this.scene.add
      .rectangle(t.x + 240, t.y, 40, 200, generateColor())
      .setOrigin(0).setStrokeStyle(1, 0x000000, 1)
      .setAlpha(0.5).setDepth(1)
      .setInteractive({ useHandCursor: true })
      .on(
        "pointerover",
        () => {
          this.makeBubble(keysArray[6].x, keysArray[6].y - 10)
          console.log(this._scales_[t.scaleIndex][6])
          keysArray[6].setAlpha(1);
          this.synth.triggerAttackRelease(this._scales_[this.scaleIndex][6], this.noteLength);
        },
        t
      )
      .on("pointerout", () => {
        keysArray[6].setAlpha(0.5);
      })


    keysArray[7] = this.scene.add
      .rectangle(t.x + 280, t.y, 40, 200, generateColor())
      .setOrigin(0).setStrokeStyle(1, 0x000000, 1)
      .setAlpha(0.5).setDepth(1)
      .setInteractive({ useHandCursor: true })
      .on(
        "pointerover",
        () => {
          this.makeBubble(keysArray[7].x, keysArray[7].y - 10)
          console.log(this._scales_[t.scaleIndex][7])
          keysArray[7].setAlpha(1);
          this.synth.triggerAttackRelease(this._scales_[this.scaleIndex][7], this.noteLength);
        },
        t
      )
      .on("pointerout", () => {
        keysArray[7].setAlpha(0.5);
      })


    keysArray[8] = this.scene.add
      .rectangle(t.x + 320, t.y, 40, 200, generateColor())
      .setOrigin(0).setStrokeStyle(1, 0x000000, 1)
      .setAlpha(0.5).setDepth(1)
      .setInteractive({ useHandCursor: true })
      .on(
        "pointerover",
        () => {
          this.makeBubble(keysArray[8].x, keysArray[8].y - 10)
          console.log(this._scales_[t.scaleIndex][8])
          keysArray[8].setAlpha(1);
          this.synth.triggerAttackRelease(this._scales_[this.scaleIndex][8], this.noteLength);
        },
        t
      )
      .on("pointerout", () => {
        keysArray[8].setAlpha(0.5);
      })


    keysArray[9] = this.scene.add
      .rectangle(t.x + 360, t.y, 40, 200, generateColor())
      .setOrigin(0).setStrokeStyle(1, 0x000000, 1)
      .setAlpha(0.5).setDepth(1)
      .setInteractive({ useHandCursor: true })
      .on(
        "pointerover",
        () => {
          this.makeBubble(keysArray[9].x, keysArray[9].y - 10)
          console.log(this._scales_[t.scaleIndex][9])
          keysArray[9].setAlpha(1);
          this.synth.triggerAttackRelease(this._scales_[this.scaleIndex][9], this.noteLength);
        },
        t
      )
      .on("pointerout", () => {
        keysArray[9].setAlpha(0.5);
      })


    keysArray[10] = this.scene.add
      .rectangle(t.x + 400, t.y, 40, 200, generateColor())
      .setOrigin(0).setStrokeStyle(1, 0x000000, 1)
      .setAlpha(0.5).setDepth(1)
      .setInteractive({ useHandCursor: true })
      .on(
        "pointerover",
        () => {
          this.makeBubble(keysArray[10].x, keysArray[10].y - 10)
          console.log(this._scales_[t.scaleIndex][10])
          keysArray[10].setAlpha(1);
          this.synth.triggerAttackRelease(this._scales_[this.scaleIndex][10], this.noteLength);
        },
        t
      )
      .on("pointerout", () => {
        keysArray[10].setAlpha(0.5);
      })


    keysArray[11] = this.scene.add
      .rectangle(t.x + 440, t.y, 40, 200, generateColor())
      .setOrigin(0).setStrokeStyle(1, 0x000000, 1)
      .setAlpha(0.5).setDepth(1)
      .setInteractive({ useHandCursor: true })
      .on(
        "pointerover",
        () => {
          this.makeBubble(keysArray[11].x, keysArray[11].y - 10)
          console.log(this._scales_[t.scaleIndex][11])
          keysArray[11].setAlpha(1);
          this.synth.triggerAttackRelease(this._scales_[this.scaleIndex][11], this.noteLength);
        },
        t
      )
      .on("pointerout", () => {
        keysArray[11].setAlpha(0.5);
      })


    keysArray[12] = this.scene.add
      .rectangle(t.x + 480, t.y, 40, 200, generateColor())
      .setOrigin(0).setDepth(1)
      .setAlpha(0.5).setStrokeStyle(1, 0x000000, 1)
      .setInteractive({ useHandCursor: true })
      .on(
        "pointerover",
        () => {
          this.makeBubble(keysArray[12].x, keysArray[12].y - 10)
          console.log(this._scales_[t.scaleIndex][12])
          keysArray[12].setAlpha(1);
          this.synth.triggerAttackRelease(this._scales_[this.scaleIndex][12], this.noteLength);
        },
        t
      )
      .on("pointerout", () => {
        keysArray[12].setAlpha(0.5);
      })


    keysArray[13] = this.scene.add
      .rectangle(t.x + 520, t.y, 40, 200, generateColor())
      .setOrigin(0).setStrokeStyle(1, 0x000000, 1)
      .setAlpha(0.5).setDepth(1)
      .setInteractive({ useHandCursor: true })
      .on(
        "pointerover",
        () => {
          this.makeBubble(keysArray[13].x, keysArray[13].y - 10)
          console.log(this._scales_[t.scaleIndex][13])
          keysArray[13].setAlpha(1);
          this.synth.triggerAttackRelease(this._scales_[this.scaleIndex][13], this.noteLength);
        },
        t
      )
      .on("pointerout", () => {
        keysArray[13].setAlpha(0.5);
      })


    keysArray[14] = this.scene.add
      .rectangle(t.x + 560, t.y, 40, 200, generateColor())
      .setOrigin(0).setDepth(1)
      .setAlpha(0.5).setStrokeStyle(1, 0x000000, 1)
      .setInteractive({ useHandCursor: true })
      .on(
        "pointerover",
        () => {
          this.makeBubble(keysArray[14].x, keysArray[14].y - 10)
          console.log(this._scales_[t.scaleIndex][14])
          keysArray[14].setAlpha(1);
          this.synth.triggerAttackRelease(this._scales_[this.scaleIndex][14], this.noteLength);
        },
        t
      )
      .on("pointerout", () => {
        keysArray[14].setAlpha(0.5);
      })

  }
  update() {

    if (this.volumeSlide.x < this.x - 25) {
      this.volumeSlide.x = this.x - 25
    }

    if (this.volumeSlide.x > this.x + 600 - 12.5) {
      this.volumeSlide.x = this.x + 600 - 12.5
    }


    // this.metronome.update()
    // this.recorder.update()
  }
}


function midiOnStateChange(event) {
  //console.log('midiOnStateChange', event);
}
function midiOnMIDImessage(event: WebMidi.MIDIMessageEvent) {
  //console.log('midiOnMIDImessage', event);
  document.dispatchEvent(new CustomEvent("midiinput", {
    detail: event.data
  }));
}
function requestMIDIAccessSuccess(midi: WebMidi.MIDIAccess) {

  var inputs = midi.inputs.values();
  for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
    // console.log('midi input', input);

    input.value.onmidimessage = midiOnMIDImessage //KeyBoard.getMIDIMessage(input);
  }
  midi.onstatechange = midiOnStateChange;
}

try {
  if (navigator.requestMIDIAccess()) {
    navigator.requestMIDIAccess().then(requestMIDIAccessSuccess);
  }
} catch (er) {
  console.log('midi access not available')
}

