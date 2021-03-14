import 'phaser'
import drumPad from './drumPad';
import { generateColor } from '../helpers/PhaserHelpers';
import { MonoSynth } from 'tone';
import BassPad from './bassPad';

export default class BassPlayer extends Phaser.GameObjects.Container {

    bg: Phaser.GameObjects.Rectangle;
    synth: MonoSynth;
    notes: string[] = ['C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'B2', 'C3'].reverse();
    helpText: Phaser.GameObjects.Text;
    pads: BassPad[] = [];
    resetButton: Phaser.GameObjects.Rectangle;
    volumeLine: Phaser.GameObjects.Rectangle;
    volumeSlide: Phaser.GameObjects.Ellipse;

    constructor(scene: Phaser.Scene, x: number, y: number, helpText?: Phaser.GameObjects.Text) {
        super(scene, x, y);
        this.setHelpText(helpText);
        this.makeControlSurface();
        this.attachSynth();
        this.makeSeqPads();
        this.addVolumeControls();
        this.scene.add.existing(this);
    }
    setHelpText(helpText: Phaser.GameObjects.Text) {
        this.helpText = helpText
    }
    makeSeqPads() {
        let ySpace = 5;
        this.notes.forEach((eachNote) => {
            let y = new BassPad(this.scene, this.x, this.y + ySpace, eachNote, this.synth, this.helpText)
            this.pads.push(y)
            ySpace = ySpace + 15
        })
    }
    attachSynth() {
        this.synth = new MonoSynth().toDestination();
        this.synth.set({
            "oscillator": {
                "type": "fmsquare5",
                "modulationType": "triangle",
                "modulationIndex": 2,
                "harmonicity": 0.501
            },
            "filter": {
                "Q": 1,
                "type": "lowpass",
                "rolloff": -24
            },
            "envelope": {
                "attack": 0.01,
                "decay": 0.1,
                "sustain": 0.4,
                "release": 2
            },
            "filterEnvelope": {
                "attack": 0.01,
                "decay": 0.1,
                "sustain": 0.8,
                "release": 1.5,
                "baseFrequency": 50,
                "octaves": 4.4
            }
        })

    }
    getSynth(){
        return this.synth
    }
    muteAll() {
        this.pads.forEach((eachPad) => {
            eachPad.muted = true
        })
    }
    unmuteAll() {
        this.pads.forEach((eachPad) => {
            eachPad.muted = false
        })
    }
    convertXtoVolume(x: number): number {

        return Math.floor((x / 10 * -1))
      }
    addVolumeControls() {
        this.volumeLine = this.scene.add.rectangle(this.x, this.y, this.width, 5, 0x000000, .25).setOrigin(0).setDepth(1)
        this.volumeSlide = this.scene.add.ellipse(this.x - 12.5, this.y - 10, 25, 25, generateColor(), 1).setStrokeStyle(2, 0x000000, .5).setDepth(2)
          .setOrigin(0).setInteractive({ useHandCursor: true, draggable: true })
          .on('pointerover', () => { this.volumeSlide.setFillStyle(generateColor(), 1); this.helpText.setText("BASS GAIN") })
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
            this.helpText.setText(`BASS GAIN: ${adjustedX} db`)
            this.synth.set({ volume: adjustedX })
          })
      }
    makeControlSurface() {
        this.bg = this.scene.add.rectangle(this.x, this.y, 410, 150, generateColor(), .75)
            .setOrigin(0).setDepth(1).setStrokeStyle(2, 0x0000, 1);
        
        this.resetButton = this.scene.add.rectangle(this.x + 405, this.y + 10, 15, 15, generateColor())
            .setDepth(3).setOrigin(0).setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0x000000, 1)
            .on('pointerdown', () => {
                this.clearAll()
            })
            .on('pointerover', () => {
                this.helpText.setText("Clear Current Bass Pattern")
            })
            .on('pointerout', () => {
                this.helpText.setText("")
            })
    }
    clearAll() {
        console.log('clearing all')
        this.pads.forEach((eachPad) => {

            eachPad.clear()
        })
    }
    update() {
        this.pads.forEach((eachPad) => {
            eachPad.update()
        })
    }
}

