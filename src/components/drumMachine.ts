import { now, Sequence, Time, Timeline, Transport } from "tone";
import { generateColor } from "../helpers/PhaserHelpers";
import DrumPad from './drumPad';
import Metronome from './metronome';
import starterLoops from './starterLoops';
interface SavedSequence { seqData: boolean[] }

export default class DrumMachine extends Phaser.GameObjects.Container {
    mainLoop: Sequence;
    sequence: boolean[] = [];
    muted: boolean = false;
    pads: DrumPad[] = [];
    showingSavedPatterns: boolean = false
    playButton: Phaser.GameObjects.Ellipse;
    savedCards: Phaser.GameObjects.Rectangle[] = [];
    savedText: Phaser.GameObjects.Text[] = [];
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
    resetButton: Phaser.GameObjects.Rectangle;
    savedSeq: SavedSequence[];
    helpText: Phaser.GameObjects.Text
    saveButton: Phaser.GameObjects.Rectangle;
    loadButton: Phaser.GameObjects.Rectangle;

    constructor(scene: Phaser.Scene, x: number, y: number, helpText?: Phaser.GameObjects.Text) {
        super(scene, x, y)
        this.helpText = helpText ? helpText : null
        // Transport.loop = true
        this.makeControls()
        this.initStarterLoops()
        this.scene.add.existing(this);
        Transport.set({swing: .1})
    }
    initStarterLoops() {
        Object.keys(starterLoops).forEach(eachKey => {
            localStorage.setItem(`PATTERN_${eachKey}`, JSON.stringify(starterLoops[eachKey]))
        });
    }
    clearAll() {
        console.log('clearing all')
        this.pads.forEach((eachPad) => {
            eachPad.clear()
        })
    }
    saveSeq() {

        let checkEdited = this.pads.map((eachPad)=>{
            return {
                passed: eachPad.getSequence().find((eachOne)=>{return eachOne === true}) !== undefined
            }
        })
        let totalCheck = checkEdited.filter((eachOne)=>{
            return eachOne.passed === true
        })
        if(totalCheck.length > 0){
            let name = prompt("Saved Pattern Name: (less than 25 chars) ");
            if (name) {
                this.savedSeq = this.pads.map((eachPad) => {
                    return {
                        seqData: eachPad.getSequence()
                    }
                })
                localStorage.setItem(`PATTERN_${name.substring(0,24)}`, JSON.stringify(this.savedSeq))
            }
        } else {
            this.helpText.setText("You must first edit the pattern to save it")
        }
        

    }
    loadSeq(id?: string) {
        console.log(id)
        let savedSeq = JSON.parse(localStorage.getItem(id)) as SavedSequence[]
        console.log(savedSeq)
        this.pads.forEach((eachPad, i) => {
            eachPad.setSequence(savedSeq[i].seqData)
        });
    }

    
    loadSavedKeys() {
        // console.log(Object.keys(localStorage))
        return Object.keys(localStorage).filter((eachKey) => {

            return eachKey.split('_')[0] === 'PATTERN'
        }

        )
    }
    makeControls() {
        let bg = this.scene.add.rectangle(this.x, this.y, 410, this.samples.length * 40, 0xc1c1c1, .5)
            .setDepth(1).setOrigin(0).setStrokeStyle(1, 0x000000, 1)
        let border = this.scene.add.rectangle(this.x + 5, this.y + 5, 400, 40, generateColor(), 1).setDepth(2).setOrigin(0).setStrokeStyle(1, 0x000000, 1)
        let ySpace = 40
        this.samples.forEach((eachOne) => {
            let y = new DrumPad(this.scene, this.x, this.y + ySpace, eachOne, this.helpText)
            this.pads.push(y)
            ySpace = ySpace + 35
        })

        this.playButton = this.scene.add.ellipse(this.x + 15, this.y + 12.5, 25, 25, generateColor()).setDepth(3).setOrigin(0)
            .setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0x000000, 1)
            .on("pointerdown", () => {
                this.playButton.setFillStyle(generateColor(), 1)
                Transport.state === "started" ? Transport.stop() : Transport.start()
            })
            .on('pointerover', () => {
                this.helpText.setText("Start / Stop Transport")
            })
            .on('pointerout', () => {
                this.helpText.setText("")
            })

            

        this.delayControl = this.scene.add.rectangle(this.x + 350, this.y + 15, 20, 20, generateColor(), 1).setDepth(2).setOrigin(0).setStrokeStyle(1, 0x000000, .25)
            .setInteractive({ useHandCursor: true, draggable: true }).setStrokeStyle(2, 0x000000, 1)
            .on('drag', (pointer: any, gameObject: Phaser.GameObjects.Rectangle, dragY: number, dragX: number) => {
                console.log(Math.floor(pointer.y - this.y) / 10)
                let y = Math.floor(pointer.y - this.y) / 10
                if (y < 0) {
                    y = 0
                }
                if (y > 1.5) {
                    y = 1.5
                }
                this.helpText.setText(y + " secs decay")
                this.pads.forEach((eachPad) => {
                    eachPad.setReverb(y)
                })
            })
            .on('pointerout', () => {
                this.helpText.setText('')
            })
            .on('pointerover', () => {
                this.helpText.setText('Drag to add Reverb and adjust decay length')
            })


        this.resetButton = this.scene.add.rectangle(this.x + 400, this.y + 15, 20, 20, generateColor(), 1)
            .setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0x000000, 1).setDepth(2).setOrigin(0)
            .on('pointerdown', () => {
                this.clearAll()
            })
            .on('pointerover', () => {
                this.helpText.setText("Clear Current Pattern")
            })
            .on('pointerout', () => {
                this.helpText.setText("")
            })


        this.saveButton = this.scene.add.rectangle(this.x + 275, this.y + 15, 20, 20, generateColor(), 1)
            .setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0x000000, 1).setDepth(2).setOrigin(0)
            .on('pointerdown', () => {
                this.saveSeq();
            })
            .on('pointerover', () => {
                this.helpText.setText("Click to Save Current Pattern")
            })
            .on('pointerout', () => {
                this.helpText.setText("")
            })

        this.loadButton = this.scene.add.rectangle(this.x + 300, this.y + 15, 20, 20, generateColor(), 1)
            .setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0x000000, 1).setDepth(2).setOrigin(0)
            .on('pointerdown', () => {
                if(!this.showingSavedPatterns){
                    let savedPatterns = this.loadSavedKeys();
                    // console.log(savedPatterns)
                    this.savedCards['holder'] = this.scene.add.rectangle(this.loadButton.x + 175, this.loadButton.y, 200, + savedPatterns.length * 25, generateColor(), 1)
                    .setStrokeStyle(3, 0x000000, 1)
                    .setDepth(2).setOrigin(0)
                    let ySpace = 0;
                    savedPatterns.forEach((eachPattern, i) => {
                        this.savedCards[i] = this.scene.add.rectangle(this.loadButton.x + 175, this.loadButton.y + ySpace, 200, 25, 0x000000, .5)
                        .setDepth(3).setOrigin(0).setInteractive({ useHandCursor: true })
                            .on('pointerover', () => {
                                this.savedCards[i].setFillStyle(0x000000, 1)
                            })
                            .on('pointerout', () => {
                                this.savedCards[i].setFillStyle(0x000000, .5)
                                // t.destroy()
                                // tText.destroy()
                            })
                            .on('pointerdown', () => {
                                this.loadSeq(eachPattern)
                                this.savedCards[i].setFillStyle(0xc1c1c1, 1)
                                // t.destroy()
                                // tText.destroy()
                            })
    
                        this.savedText[i] = this.scene.add.text(this.savedCards[i].x + 5, this.savedCards[i].y + 5, eachPattern.split('_')[1], { fontSize: '12px', color: '#ffffff' }).setDepth(3).setOrigin(0)
    
                        ySpace += 25
    
                    })
                } else {
                    Object.keys(this.savedCards).forEach((eachCard)=>{
                        this.savedCards[eachCard].destroy()
                    })

                    Object.keys(this.savedText).forEach((eachText)=>{
                        this.savedText[eachText].destroy()
                    })
                }
                this.showingSavedPatterns = !this.showingSavedPatterns
                
            })
            .on('pointerover', () => {
                this.helpText.setText("Click to toggle Patterns")
            })
            .on('pointerout', () => {
                this.helpText.setText("")
            })

        this.metronome = new Metronome(this.scene, this.x + 410, this.y + 5, 110, 25, 100, this.helpText);
        // guidelines for measures
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