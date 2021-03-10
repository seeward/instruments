import { AMSynth, Chorus, Delay, Distortion, Filter, FMSynth, immediate, MembraneSynth, MonoSynth, now, Pattern, PingPongDelay, PluckSynth, PolySynth, Recorder, Reverb, Sequence, Synth, Transport } from 'tone';
import 'phaser';
import { generateColor } from '../helpers/PhaserHelpers';
import Metronome from './metronome';
import CustomRecorder from './recorder';
import 'webmidi';
import 'navigator';
import SynthManager from './synthManager'
import Drums from './sampler';
import * as mm from '@magenta/music';

export default class KeyBoard extends Phaser.GameObjects.Container {

  _scales_: any[]
  synth: PluckSynth | PolySynth | FMSynth | AMSynth | MembraneSynth
  synths: any[] = []
  currentSynthIndex: number = 0
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
  scaleIndex: number = 1
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

  constructor(scene: Phaser.Scene, x: number, y: number, recorder?: CustomRecorder, effect?: Delay | PingPongDelay | Distortion | Filter | Chorus, synth?: PolySynth | FMSynth | MembraneSynth | AMSynth, helpText?: Phaser.GameObjects.Text) {
    super(scene, x, y);
    this.helpText = helpText ? helpText : null
    this.synthManager = new SynthManager(this.scene, 0, 0, this.helpText);
    this.scene.add.existing(this);
    this.dist = new Distortion(.25).toDestination()
    this._scales_ = [
      [
        "A4",
        "B4",
        "C4",
        "D4",
        "E4",
        "F4",
        "G4",
        "A5",
        "B5",
        "C5",
        "D5",
        "E5",
        "F5",
        "G5",
        "A6"
      ],
      [
        "C4",
        "D4",
        "D#4",
        "F4",
        "G4",
        "G#4",
        "A#4",
        "C5",
        "D5",
        "D#5",
        "F5",
        "G5",
        "G#5",
        "A#5",
        "C6"
      ],
      ["C2", "D2", "E2", "F2", "G2", "A2", "B2", "C2"],
      ["C3", "D3", "E3", "F3", "G3", "A3", "B3", "C3"],
      [
        "C4",
        "D4",
        "D#4",
        "F4",
        "G4",
        "G#4",
        "A#4",
        "C5",
        "D5",
        "D#5",
        "F5",
        "G5",
        "G#5",
        "A#5",
        "C6"
      ],
      ["C5", "D5", "ED#", "F5", "G5", "G#5", "A#5", "C6"]
    ];
    let self = this;
    document.addEventListener("midiinput", function (event: any) {
      self.getMIDIMessage(event.detail);
    });
    let defaultSynth = synth ? synth : new FMSynth().toDestination()

    if (effect) {
      this.effect = effect
      defaultSynth.connect(effect);
    }
    this.recorder = recorder

    defaultSynth.connect(this.recorder.getRecorder());
    
    let verb = new Reverb(.5).toDestination();
    defaultSynth.chain(verb, this.dist);
    this.synths.push(defaultSynth);
    this.initSynths();
    this.synth = this.synths[0];
    this.synth.set({ volume: 10 })
    this.createKeyboardControls(this);
    this.addVolumeControls();
    this.addToneControls();
    this.addEffectControls();
    this.addNoteLengthControls()
    this.addMetronome();
    this.addBubbleControl();

  }

  async initSynths() {
    if (this.synthManager) {
      let ss = await this.synthManager.getSynths()

      this.synths = ss
    } else {
      this.synths.push(new FMSynth().toDestination(), new PluckSynth({ dampening: 1000, attackNoise: 2, release: 750 }).toDestination(), new MembraneSynth({ volume: -10 }).toDestination())

    }
  }
  public playSequence(seq:{notes: any[]}) {
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
  getBetweenZeroAndOne(val, max, min) {
    return (val - min) / (max - min);
  }
  convertXToEffectParam1(x: number) {
    // console.log(x)
    return 1 / Math.floor(x) * 10
  }
  convertYToEffectParam2(y: number) {
    console.log(y)
    return Math.floor(y) / 100
  }
  addMetronome() {
    // nome = new Metronome(this.scene, this.effectBG.x + this.effectBG.width, this.effectBG.y, 110, 25, 100)
  }
  addEffectControls() {
    this.tooltip = this.scene.add.text(this.x + 615, this.y + 140, '', { color: '#000000', fontSize: '12px' }).setOrigin(0).setDepth(1)
    this.effectBG = this.scene.add.rectangle(this.x + 600, this.y, 100, 100, 0xc1c1c1, .5).setOrigin(0).setDepth(1).setStrokeStyle(2,0x000000, 1)
    this.effectBGInner = this.scene.add.rectangle(this.x + 610, this.y + 10, 80, 80, 0xffffff, 1).setOrigin(0).setDepth(1).setStrokeStyle(1,0x000000, .5)
    this.effectStick = this.scene.add.rectangle(this.effectBG.x + 10, this.effectBG.y + 10, 25, 25, generateColor(), 1).setDepth(2)
      .setOrigin(0)
      .on('pointerover', () => { this.effectStick.setFillStyle(generateColor()); })
      .on('pointerout', () => { this.effectStick.setFillStyle(generateColor()); this.helpText.setText("") })
      .setInteractive({ useHandCursor: true, draggable: true })
      .on('drag', (pointer: any, gameObject: Phaser.GameObjects.Rectangle, dragY: number, dragX: number) => {

        let x = pointer.position.x - this.effectBG.x
        let y = pointer.position.y - this.effectBG.y
        // console.log(y)
        if (x < 0) {
          x = 0
        }
        if (x > 100) {
          x = 100
        }
        if (y < 0) {
          y = 0
        }
        if (y > 100) {
          y = 100
        }
        let delayLvl = this.convertXToEffectParam1(x);
        let distLvl = this.convertYToEffectParam2(y);

        this.effect.set({
          delayTime: delayLvl
        })
        
        this.dist.set({
          distortion: distLvl
        })

        this.helpText.setText(`${delayLvl.toFixed(2)} Delay: ${distLvl} Distortion`)
        this.effectStick.x = pointer.position.x
        this.effectStick.y = pointer.position.y

      })
    this.effectStickInner = this.scene.add.ellipse(this.effectStick.x + 7.5, this.effectStick.y + 7.5, 10, 10, 0x000000, 1).setOrigin(0).setDepth(3)
    this.delayControl = this.scene.add.ellipse(this.effectBG.x + 10, this.effectBG.y + 110, 10, 10, generateColor(), 1).setDepth(1)
      .setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0x000000, 1)
      .on('pointerover', () => { this.delayControl.setScale(2); this.helpText.setText("DELAY") })
      .on('pointerout', () => { this.delayControl.setScale(1); this.helpText.setText("") })
      .on('pointerdown', () => {
        if (!this.effectConnectFlag) {
          this.synth.disconnect(this.effect)
          this.delayControl.setAlpha(.25)
        } else {
          this.synth.connect(this.effect)
          this.delayControl.setAlpha(1)
        }
        this.effectConnectFlag = !this.effectConnectFlag
      })
    this.distControl = this.scene.add.ellipse(this.effectBG.x + 30, this.effectBG.y + 110, 10, 10, generateColor(), 1).setDepth(1)
      .setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0x000000, 1)
      .on('pointerover', () => { this.distControl.setScale(2); this.helpText.setText("DISTORTION") })
      .on('pointerout', () => { this.distControl.setScale(1); this.helpText.setText("") })
      .on('pointerdown', () => {
        if (!this.distConnectFlag) {
          this.distControl.setAlpha(.25)
          this.dist.set({
            distortion: 0
          })
          
        } else {
          this.distControl.setAlpha(1)
          this.dist.set({
            distortion: .25
          })
          
        }
        this.distConnectFlag = !this.distConnectFlag
      })
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
    // console.log(noteObject)
    console.log(noteObject)
    if (noteObject.com == 146) {
      console.log(this.noteMidiToString(noteObject.note))
      // noteOn
      t.synth.triggerAttack(
        this.noteMidiToString(noteObject.note)
      );
    } else if (noteObject.com === 130) {
      // noteOff
      console.log(this.noteMidiToString(noteObject.note))
      t.synth.triggerRelease(
        this.noteMidiToString(noteObject.note)
      );
    }
  }
  addVolumeControls() {
    this.volumeLine = this.scene.add.rectangle(this.x, this.y, 600, 5, 0x000000, .25).setOrigin(0).setDepth(1)
    this.volumeSlide = this.scene.add.ellipse(this.x - 12.5, this.y - 10, 25, 25, generateColor(), 1).setStrokeStyle(2, 0x000000, .5).setDepth(2)
      .setOrigin(0).setInteractive({ useHandCursor: true, draggable: true })
      .on('pointerover', () => { this.volumeSlide.setFillStyle(generateColor(), 1); this.helpText.setText("GAIN") })
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
        this.helpText.setText(`GAIN: ${adjustedX} db`)
        this.synth.set({ volume: adjustedX })
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
    if (this.effect && this.recorder) {
      newtone.chain(this.effect, this.dist, new Reverb(.5).toDestination(), this.recorder.getRecorder())
    }
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
      .on('pointerdown', () => {
        this.makeBubbles = !this.makeBubbles
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
          t.synth.triggerAttackRelease(this._scales_[t.scaleIndex][0], this.noteLength);
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

          keysArray[1].setAlpha(1);
          t.synth.triggerAttackRelease(this._scales_[this.scaleIndex][1], this.noteLength);
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

          keysArray[2].setAlpha(1);
          t.synth.triggerAttackRelease(this._scales_[this.scaleIndex][2], this.noteLength);
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

          keysArray[3].setAlpha(1);
          t.synth.triggerAttackRelease(this._scales_[this.scaleIndex][3], this.noteLength);
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

          keysArray[4].setAlpha(1);
          t.synth.triggerAttackRelease(this._scales_[this.scaleIndex][4], this.noteLength);
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

          keysArray[5].setAlpha(1);
          t.synth.triggerAttackRelease(this._scales_[this.scaleIndex][5], this.noteLength);
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

          keysArray[6].setAlpha(1);
          t.synth.triggerAttackRelease(this._scales_[this.scaleIndex][6], this.noteLength);
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

          keysArray[7].setAlpha(1);
          t.synth.triggerAttackRelease(this._scales_[this.scaleIndex][7], this.noteLength);
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

          keysArray[8].setAlpha(1);
          t.synth.triggerAttackRelease(this._scales_[this.scaleIndex][8], this.noteLength);
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

          keysArray[9].setAlpha(1);
          t.synth.triggerAttackRelease(this._scales_[this.scaleIndex][9], this.noteLength);
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

          keysArray[10].setAlpha(1);
          t.synth.triggerAttackRelease(this._scales_[this.scaleIndex][10], this.noteLength);
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

          keysArray[11].setAlpha(1);
          t.synth.triggerAttackRelease(this._scales_[this.scaleIndex][11], this.noteLength);
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

          keysArray[12].setAlpha(1);
          t.synth.triggerAttackRelease(this._scales_[this.scaleIndex][12], this.noteLength);
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

          keysArray[13].setAlpha(1);
          t.synth.triggerAttackRelease(this._scales_[this.scaleIndex][13], this.noteLength);
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

          keysArray[14].setAlpha(1);
          t.synth.triggerAttackRelease(this._scales_[this.scaleIndex][14], this.noteLength);
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

    if (this.effectStick && this.effectBG) {
      if (this.effectStick.x > this.effectBG.x + 65) {
        this.effectStick.x = this.effectBG.x + 65
      }
      if (this.effectStick.x < this.effectBG.x) {
        this.effectStick.x = this.effectBG.x
      }
      if (this.effectStick.y > this.effectBG.y + 65) {
        this.effectStick.y = this.effectBG.y + 65
      }
      if (this.effectStick.y < this.effectBG.y + 10) {
        this.effectStick.y = this.effectBG.y + 10
      }
      this.effectStickInner.x = this.effectStick.x + 7.5
      this.effectStickInner.y = this.effectStick.y + 7.5
    }
    // this.metronome.update()
    this.recorder.update()
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

