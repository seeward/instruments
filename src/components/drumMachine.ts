import { Sequence, Time, Timeline, Transport } from "tone";
import { generateColor } from "../helpers/PhaserHelpers";
import DrumPad from './drumPad';
import Metronome from './metronome';

export default class DrumMachine extends Phaser.GameObjects.Container {
    mainLoop: Sequence;
    sequence: boolean[] = [];
    muted: boolean = false;
    pads: DrumPad[] = [];
    playButton: Phaser.GameObjects.Ellipse;
    samples: string[] = [
        "/assets/samples/r8-Kick.wav",
        "/assets/samples/r8-HiHat.wav",
        "/assets/samples/r8-HiHat Accent.wav",
        "/assets/samples/r8-Snare.wav",
        "/assets/samples/r8-Snare Accent.wav",
        "/assets/samples/r8-Tamb 1.wav",
        "/assets/samples/r8-Tamb 2.wav",
        "/assets/samples/r8-Guiro 1.wav",
        "/assets/samples/r8-Bongo Low.wav",
        "/assets/samples/r8-Bongo High.wav",
        "/assets/samples/r8-Cymbal.wav",

    ]
    metronome: Metronome;
    delayControl: Phaser.GameObjects.Rectangle;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y)
        this.makeControls()

        this.scene.add.existing(this);
    }

    makeControls() {
        let bg = this.scene.add.rectangle(this.x, this.y, 410, this.samples.length * 40, 0xc1c1c1, 1)
            .setDepth(1).setOrigin(0).setStrokeStyle(1, 0x000000, 1)
        let border = this.scene.add.rectangle(this.x + 5, this.y + 5, 400, 40, generateColor(), 1).setDepth(2).setOrigin(0).setStrokeStyle(1, 0x000000, 1)
        let ySpace = 40
        this.samples.forEach((eachOne) => {
            let y = new DrumPad(this.scene, this.x, this.y + ySpace, eachOne)
            this.pads.push(y)
            ySpace = ySpace + 35

        })

        this.playButton = this.scene.add.ellipse(this.x + 15, this.y + 12.5, 25, 25, generateColor()).setDepth(3).setOrigin(0)
            .setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0x000000, 1)
            .on("pointerdown", () => {
                this.playButton.setFillStyle(generateColor(), 1)
                Transport.state === "started" ? Transport.stop() : Transport.start();
            })
        this.delayControl = this.scene.add.rectangle(this.x + 50, this. y + 15, 20,20,generateColor(), 1).setDepth(2).setOrigin(0).setStrokeStyle(1, 0x000000, .25)
        .setInteractive({useHandCursor: true, draggable: true}).setStrokeStyle(2, 0x000000,1)
        .on('drag', (pointer: any, gameObject: Phaser.GameObjects.Rectangle, dragY: number, dragX: number) => {
            console.log(Math.floor(pointer.y - this.y) / 10)
            let y = Math.floor(pointer.y - this.y) / 10
            if(y < 0){
                y = 0
            }
            if(y > 5){
                y = 5
            }
            delayLevelText.setText(y + " secs decay")
            this.pads.forEach((eachPad)=>{
                eachPad.setReverb(y)
            })
        })    
        .on('pointerout', ()=>{
            delayLevelText.setText('')
        })
        let delayLevelText = this.scene.add.text(this.delayControl.x + 25, this.delayControl.y, "", {fontSize: '12px', color: '#000000'}).setDepth(3).setOrigin(0)
        this.metronome = new Metronome(this.scene, this.x + 410, this.y + 5, 120, 25, 100);

        this.scene.add.line(this.x, this.y, this.x + 192, this.y + 30, this.x + 192, this.y + 390, 0x000000, 1)
            .setDepth(2).setOrigin(0).setStrokeStyle(1, 0xff0000, .25)
        this.scene.add.line(this.x, this.y, this.x + 112, this.y + 30, this.x + 112, this.y + 390, 0x000000, 1)
            .setDepth(2).setOrigin(0).setStrokeStyle(1, 0x000000, .25)
        this.scene.add.line(this.x, this.y, this.x + 272, this.y + 30, this.x + 272, this.y + 390, 0x000000, 1)
            .setDepth(2).setOrigin(0).setStrokeStyle(1, 0x000000, .25)

    }

    playSequence() {

    }
    initPads() {

    }

    update() {
        this.metronome.update();
    }
}