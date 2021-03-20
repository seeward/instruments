import { Player, Sequence, Transport } from "tone";
import { generateColor } from "../helpers/PhaserHelpers";
import DrumPad from './drumPad';
import Metronome from './metronome';
import starterLoops from './starterLoops';
import MachineMusicMan, { ModelCheckpoints, MLModels } from '../components/mlmusician'
import { forEachChild } from "typescript";

export interface SavedSequence { seqData: boolean[] }

export default class DrumMachine extends Phaser.GameObjects.Container {

    mlPatternGenerator: MachineMusicMan
    midiDrums: number[] = [36, 38, 42, 46, 41, 43, 45, 49, 51];
    reverseMidiMapping: Map<number, number> = new Map([
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
    player: Player
    mainLoop: Sequence;
    sequence: boolean[] = [];
    muted: boolean = false;
    pads: DrumPad[] = [];
    sampleIndex: number = 0
    swing: number = 0
    showingSavedPatterns: boolean = false
    playButton: Phaser.GameObjects.Ellipse;
    savedCards: Phaser.GameObjects.Rectangle[] = [];
    savedText: Phaser.GameObjects.Text[] = [];
    samples: string[][] = [[
        "/assets/samples/r8-Kick.wav",
        "/assets/samples/r8-HiHat.wav",
        "/assets/samples/r8-HiHat Accent.wav",
        "/assets/samples/r8-Snare Accent.wav",
        "/assets/samples/r8-Tamb 1.wav",
        "/assets/samples/r8-Tamb 2.wav",
        "/assets/samples2/hihat3.wav",
        "/assets/samples/r8-Bongo Low.wav",
        "/assets/samples/r8-Bongo High.wav",
        "/assets/samples/r8-Cymbal.wav",

    ], [
        "/assets/samples2/kick.wav",
        "/assets/samples2/hihat1.wav",
        "/assets/samples2/hihat2.wav",
        "/assets/samples2/snare1.wav",
        "/assets/samples2/snare2.wav",
        "/assets/samples2/hihat3.wav",
        "/assets/samples2/hihat3.wav",
        "/assets/samples/r8-Bongo Low.wav",
        "/assets/samples/r8-Bongo High.wav",
        "/assets/samples/r8-Cymbal.wav",
    ]]
    metronome: Metronome;
    delayControl: Phaser.GameObjects.Rectangle;
    resetButton: Phaser.GameObjects.Rectangle;
    savedSeq: SavedSequence[];
    helpText: Phaser.GameObjects.Text
    saveButton: Phaser.GameObjects.Rectangle;
    loadButton: Phaser.GameObjects.Rectangle;
    showingSampleMenu: boolean = false;
    sampleButton: Phaser.GameObjects.Rectangle;
    savedKits: {} = {};
    savedKitText: {} = {};
    bg: Phaser.GameObjects.Rectangle;
    border: Phaser.GameObjects.Rectangle;
    guide1: Phaser.GameObjects.Line;
    guide2: Phaser.GameObjects.Line;
    guide3: Phaser.GameObjects.Line;
    generatedPattern: any[] = [];
    MLButton: Phaser.GameObjects.Ellipse;
    patternLoaded: any;
    tempSlider: Phaser.GameObjects.Rectangle;
    logText: Phaser.GameObjects.Text;
    swingSlider: Phaser.GameObjects.Rectangle;
    muteButton: Phaser.GameObjects.Ellipse;
    allMuted: boolean = false;
    volumeLine: Phaser.GameObjects.Rectangle;
    volumeSlide: Phaser.GameObjects.Ellipse;
    mlText: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, x: number, y: number, helpText?: Phaser.GameObjects.Text, logText?: Phaser.GameObjects.Text) {
        super(scene, x, y)
        this.helpText = helpText ? helpText : null
        this.logText = logText ? logText : null
        this.player = new Player();
        this.mlPatternGenerator = new MachineMusicMan(MLModels.RNN, ModelCheckpoints.DrumRNN, this.helpText, this.logText);
        this.makeControls()
        this.initStarterLoops()
        this.addVolumeControls();
        this.scene.add.existing(this);

    }
    getPlayers(){
        return this.pads.map((eachPad)=>{
            return eachPad.getPlayer();
        })
    }
    async getSeedLoop() {

        if (this.mlPatternGenerator.isInitialised()) {
            this.logText.setText("Formatting Seed Pattern")
            const seed = []
            const finalConvertedSeed = []
            // get the current sequence from each pad
            this.pads.forEach((eachPad, i) => {
                seed.push(eachPad.getSequence())
            })

            // break into 16 chunks with indexs
            for (let i = 0; i < 16; i++) {
                seed.forEach((eachSeq, ind) => {

                    if (Array.isArray(finalConvertedSeed[i])) {

                        if (eachSeq[i]) {
                            finalConvertedSeed[i].push(ind)
                        }

                    } else {

                        if (eachSeq[i]) {
                            finalConvertedSeed[i] = []
                            finalConvertedSeed[i].push(ind)
                        } else {
                            finalConvertedSeed[i] = []
                        }

                    }

                })
            }

            this.logText.setText("Processing seed pattern with ML model")
            // call our ML model 
            let newPart = await this.mlPatternGenerator.generateNewDrumPart(finalConvertedSeed);
            // check our results
            newPart ? this.logText.setText("Formatting AI Generated Pattern") : this.logText.setText("Failed to generate AI Beat :(")
            let newSequences = [];
            // if we got a new model as an array 
            if (Array.isArray(newPart)) {
                // break up the output from the ml model 
                this.pads.forEach((eachPad, i) => {

                    newPart.forEach((eachStep: any[], stepIndx: number) => {

                        if (eachStep.indexOf(i) > -1) {
                            if (!Array.isArray(newSequences[i])) {
                                newSequences[i] = []
                            }
                            newSequences[i].push(true)
                        } else {
                            if (!Array.isArray(newSequences[i])) {
                                newSequences[i] = []
                            }
                            newSequences[i].push(false)
                        }
                    });

                })

                this.generatedPattern = newSequences;
                // load the AI beat into the drum pads
                this.loadGeneratedLoop(this.generatedPattern);

            }
        }

    }
    setSwing(num: number) {
        this.swing = num
        Transport.set({ swing: num })
    }

    convertXtoVolume(x: number): number {

        return Math.floor((x / 10 * -1))
    }
    addVolumeControls() {
        this.volumeLine = this.scene.add.rectangle(this.x, this.y, this.width, 5, 0x000000, .25).setOrigin(0).setDepth(1)
        this.volumeSlide = this.scene.add.ellipse(this.x - 12.5, this.y - 10, 25, 25, generateColor(), 1).setStrokeStyle(2, 0x000000, .5).setDepth(2)
            .setOrigin(0).setInteractive({ useHandCursor: true, draggable: true })
            .on('pointerover', () => { this.volumeSlide.setFillStyle(generateColor(), 1); this.helpText.setText("DRUMS GAIN") })
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
                this.helpText.setText(`DRUMS GAIN: ${adjustedX} db`)
                this.setDrumVolumes(adjustedX)
            })
    }
    setDrumVolumes(vol: number){
        this.pads.forEach((eachPad)=>{
            eachPad.sound.set({volume: vol})
        })
    }
    loadGeneratedLoop(savedSeq) {
        console.log(savedSeq)
        this.helpText.setText("AI generated beat loaded")
        this.logText.setText('AI beat formatted and translated for loading')
        this.pads.forEach((eachPad, i) => {
            // console.log(savedSeq[i])
            if (savedSeq[i]) {
                eachPad.setSequence(savedSeq[i])
            }

        });
    }
    loadMainSeqLoop(savedSeq) {
        console.log(savedSeq)
       
        this.pads.forEach((eachPad, i) => {
            console.log(savedSeq[i])
            if (savedSeq[i]) {
                eachPad.setSequence(savedSeq[i].seqData)
            }

        });
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
    reloadSamples() {
        this.guide1.destroy()
        this.guide2.destroy()
        this.guide3.destroy()

        this.guide1 = this.scene.add.line(this.x, this.y, this.x + 192, this.y + 30, this.x + 192, this.y + this.samples[this.sampleIndex].length * 40, 0x000000, 1)
            .setDepth(2).setOrigin(0).setStrokeStyle(1, 0xff0000, .25)
        this.guide2 = this.scene.add.line(this.x, this.y, this.x + 112, this.y + 30, this.x + 112, this.y + this.samples[this.sampleIndex].length * 40, 0x000000, 1)
            .setDepth(2).setOrigin(0).setStrokeStyle(1, 0x000000, .25)
        this.guide3 = this.scene.add.line(this.x, this.y, this.x + 272, this.y + 30, this.x + 272, this.y + this.samples[this.sampleIndex].length * 40, 0x000000, 1)
            .setDepth(2).setOrigin(0).setStrokeStyle(1, 0x000000, .25)
        this.bg.destroy();
        this.bg = this.scene.add.rectangle(this.x, this.y, 410, this.samples[this.sampleIndex].length * 45, 0xc1c1c1, .5)
            .setDepth(1).setOrigin(0).setStrokeStyle(1, 0x000000, 1)

        // console.log(this.sampleIndex)
        let ySpace = 40;
        this.pads.forEach((eachPad) => {
            eachPad.onDestroy()
            eachPad.destroy();
        })

        this.samples[this.sampleIndex].forEach((eachOne) => {

            let y = new DrumPad(this.scene, this.x, this.y + ySpace, eachOne, this.player, this.helpText)
            this.pads.push(y)
            ySpace = ySpace + 35
        })
    }
    saveSeq() {
        Transport.stop()
        let checkEdited = this.pads.map((eachPad) => {
            return {
                passed: eachPad.getSequence().find((eachOne) => { return eachOne === true }) !== undefined
            }
        })
        let totalCheck = checkEdited.filter((eachOne) => {
            return eachOne.passed === true
        })
        if (totalCheck.length > 0) {
            this.helpText.setText("Saving pattern...")
            let name = prompt("Saved Pattern Name: (less than 10 chars) ");
            if (name) {
                this.savedSeq = this.pads.map((eachPad) => {
                    return {
                        seqData: eachPad.getSequence()
                    }
                })
                localStorage.setItem(`ORIGINAL_${name.substring(0, 10)}`, JSON.stringify(this.savedSeq))
            }
        } else {
            this.helpText.setText("You must first edit the drum pattern")
        }


    }
    loadSeq(id?: string) {
        // console.log(id)
        let savedSeq = JSON.parse(localStorage.getItem(id)) as SavedSequence[]
        // console.log(savedSeq)
        this.pads.forEach((eachPad, i) => {
            // console.log(savedSeq[i])
            if (savedSeq[i]) {
                eachPad.setSequence(savedSeq[i].seqData)
            }
        });
        this.patternLoaded = true


    }
    loadSavedKeys() {
        // console.log(Object.keys(localStorage))
        return Object.keys(localStorage).filter((eachKey) => {

            return eachKey.split('_')[0] === 'PATTERN'
        }

        )
    }
    makeControls() {

        this.bg = this.scene.add.rectangle(this.x, this.y, 410, this.samples[this.sampleIndex].length * 40, 0xc1c1c1, .5)
            .setDepth(1).setOrigin(0).setStrokeStyle(1, 0x000000, 1)
        this.border = this.scene.add.rectangle(this.x + 5, this.y + 5, 400, 40, generateColor(), 1).setDepth(2).setOrigin(0).setStrokeStyle(1, 0x000000, 1)
        let ySpace = 40
        this.samples[this.sampleIndex].forEach((eachOne) => {
            console.log('adding sample pad')
            this.pads.push(new DrumPad(this.scene, this.x, this.y + ySpace, eachOne, this.player, this.helpText))
            ySpace = ySpace + 35
        })
        this.tempSlider = this.scene.add.rectangle(this.x + 340, this.y + 17.5, 15, 15, generateColor()).setDepth(3).setOrigin(0)
            .setInteractive({ useHandCursor: true, draggable: true }).setStrokeStyle(1, 0x000000, 1)
            .on('drag', (pointer: any, gameObject: Phaser.GameObjects.Rectangle, dragY: number, dragX: number) => {

                let y = 0
                if (dragY < 10) {
                    y = 1.0
                }
                if (dragY > 10) {
                    y = 1.1
                }
                if (dragY > 20) {
                    y = 1.15
                }
                if (dragY > 30) {
                    y = 1.2
                }
                if (dragY > 40) {
                    y = 1.25
                }
                if (dragY > 50) {
                    y = 1.3
                }
                if (dragY > 60) {
                    y = 1.35
                }
                if (dragY > 70) {
                    y = 1.4
                }
                if (dragY > 80) {
                    y = 1.45
                }
                if (dragY > 90) {
                    y = 1.5
                }


                console.log(scrollY);
                this.mlPatternGenerator.setTempurature(y)
                this.helpText.setText(`Current Deviation from Seed: ${this.mlPatternGenerator._temperature}`)

            })
            .on('pointerover', () => {
                if (this.patternLoaded) {
                    this.helpText.setText("Drag to change temperature of AI Beats");
                } else {
                    this.helpText.setText("Load a seed pattern for AI Beats")
                }

            })
            .on('pointerout', () => {
                this.helpText.setText("")
            })


        this.swingSlider = this.scene.add.rectangle(this.x + 75, this.y + 17.5, 15, 15, generateColor()).setDepth(3).setOrigin(0)
            .setInteractive({ useHandCursor: true, draggable: true }).setStrokeStyle(1, 0x000000, 1)
            .on('drag', (pointer: any, gameObject: Phaser.GameObjects.Rectangle, dragY: number, dragX: number) => {

                let y = 0


                if (dragY < 10) {
                    y = 0
                }
                if (dragY > 10) {
                    y = .2
                }
                if (dragY > 20) {
                    y = .3
                }
                if (dragY > 30) {
                    y = .4
                }
                if (dragY > 40) {
                    y = .5
                }
                if (dragY > 50) {
                    y = .6
                }
                if (dragY > 60) {
                    y = .7
                }
                if (dragY > 70) {
                    y = .8
                }
                if (dragY > 80) {
                    y = .9
                }
                if (dragY > 90) {
                    y = 1
                }


                console.log(scrollY);
                this.setSwing(y)
                this.helpText.setText(`Current Swing: ${y}`)

            })
            .on('pointerover', () => {
                this.helpText.setText("Drag to change swing of the groove");

            })
            .on('pointerout', () => {
                this.helpText.setText("")
            })

            let mlshadow = this.scene.add.ellipse(this.x + 363, this.y + 13, 30, 30, 0x000000, .75).setDepth(2).setOrigin(0)
        

        this.MLButton = this.scene.add.ellipse(this.x + 360, this.y + 10, 30, 30, generateColor()).setDepth(3).setOrigin(0)
            .setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0x000000, 1)
            .on("pointerdown", async () => {
                if (this.patternLoaded) {
                    this.helpText.setText("Generating AI Drum Beat")
                    await this.getSeedLoop();
                }

            })
            .on('pointerover', () => {
                if (this.patternLoaded) {
                    this.helpText.setText("Click to Generate AI Drum Beat")
                } else {
                    this.helpText.setText("Load a seed pattern for AI Beats")
                }

            })
            .on('pointerout', () => {
                this.helpText.setText("")
            })
        this.mlText = this.scene.add.text(this.MLButton.x + 5, this.MLButton.y + 5, 'AI', { fontSize: '18px', color: '#000000'}).setDepth(4).setOrigin(0)


        this.muteButton = this.scene.add.ellipse(this.x + 15, this.y + 12.5, 25, 25, generateColor()).setDepth(3).setOrigin(0)
            .setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0x000000, 1)
            .on("pointerdown", () => {
                if (this.allMuted) {
                    this.muteButton.setAlpha(1)
                    this.unmuteAll()
                    this.allMuted = !this.allMuted
                } else {
                    this.allMuted = !this.allMuted
                    this.muteAll()
                    this.muteButton.setAlpha(.5)
                }


            })
            .on('pointerover', () => {
                this.helpText.setText("Mute / Unmute Drum pattern")
            })
            .on('pointerout', () => {
                this.helpText.setText("")
            })



        // this.delayControl = this.scene.add.rectangle(this.x + 50, this.y + 15, 20, 20, generateColor(), 1).setDepth(2).setOrigin(0).setStrokeStyle(1, 0x000000, .25)
        //     .setInteractive({ useHandCursor: true, draggable: true }).setStrokeStyle(2, 0x000000, 1)
        //     .on('drag', (pointer: any, gameObject: Phaser.GameObjects.Rectangle, dragY: number, dragX: number) => {
        //         console.log(Math.floor(pointer.y - this.y) / 10)
        //         let y = Math.floor(pointer.y - this.y) / 10
        //         if (y < 0) {
        //             y = 0
        //         }
        //         if (y > 1.5) {
        //             y = 1.5
        //         }
        //         this.helpText.setText(y + " secs decay")
        //         this.pads.forEach((eachPad) => {
        //             eachPad.setReverb(y)
        //         })
        //     })
        //     .on('pointerout', () => {
        //         this.helpText.setText('')
        //     })
        //     .on('pointerover', () => {
        //         this.helpText.setText('Drag to add Reverb and adjust decay length')
        //     })


        this.resetButton = this.scene.add.rectangle(this.x + 400, this.y + 15, 20, 20, generateColor(), 1)
            .setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0x000000, 1).setDepth(2).setOrigin(0)
            .on('pointerdown', () => {
                this.clearAll()
            })
            .on('pointerover', () => {
                this.helpText.setText("Clear Current Drum Pattern")
            })
            .on('pointerout', () => {
                this.helpText.setText("")
            })


        this.saveButton = this.scene.add.rectangle(this.x + 200, this.y + 15, 20, 20, generateColor(), 1)
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

        this.loadButton = this.scene.add.rectangle(this.x + 225, this.y + 15, 20, 20, generateColor(), 1)
            .setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0x000000, 1).setDepth(2).setOrigin(0)
            .on('pointerdown', () => {
                if (!this.showingSavedPatterns) {
                    let savedPatterns = this.loadSavedKeys();
                    // console.log(savedPatterns)
                    this.savedCards['holder'] = this.scene.add.rectangle(this.loadButton.x + 200, this.loadButton.y - 15, 200, + savedPatterns.length * 25, generateColor(), 1)
                        .setStrokeStyle(3, 0x000000, 1)
                        .setDepth(3).setOrigin(0)
                    let ySpace = -15;
                    savedPatterns.forEach((eachPattern, i) => {
                        this.savedCards[i] = this.scene.add.rectangle(this.loadButton.x + 200, this.loadButton.y + ySpace, 200, 25, 0x000000, .5)
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
                                this.helpText.setText(`Loaded: ${eachPattern.split('_')[1]}`)
                                this.savedCards[i].setFillStyle(0xc1c1c1, 1)
                                // t.destroy()
                                // tText.destroy()
                            })

                        this.savedText[i] = this.scene.add.text(this.savedCards[i].x + 5, this.savedCards[i].y + 5, eachPattern.split('_')[1], { fontSize: '12px', color: '#ffffff' }).setDepth(3).setOrigin(0)

                        ySpace += 25

                    })
                } else {
                    Object.keys(this.savedCards).forEach((eachCard) => {
                        this.savedCards[eachCard].destroy()
                    })

                    Object.keys(this.savedText).forEach((eachText) => {
                        this.savedText[eachText].destroy()
                    })
                }
                this.showingSavedPatterns = !this.showingSavedPatterns

            })
            .on('pointerover', () => {
                this.helpText.setText("Click to toggle Seed Patterns")
            })
            .on('pointerout', () => {
                this.helpText.setText("")
            })



        // this.sampleButton = this.scene.add.rectangle(this.x + 200, this.y + 15, 20, 20, generateColor(), 1)
        //     .setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0x000000, 1).setDepth(2).setOrigin(0)
        //     .on('pointerdown', () => {
        //         if(!this.showingSampleMenu){
        //             let sampleKits = this.samples;

        //             this.savedKits['holder'] = this.scene.add.rectangle(this.sampleButton.x + 225, this.sampleButton.y, 200, + sampleKits.length * 25, generateColor(), 1)
        //             .setStrokeStyle(3, 0x000000, 1)
        //             .setDepth(2).setOrigin(0)
        //             let ySpace = 0;
        //             sampleKits.forEach((eachPattern, i) => {
        //                 this.savedKits[i] = this.scene.add.rectangle(this.sampleButton.x + 225, this.sampleButton.y + ySpace, 200, 25, 0x000000, .5)
        //                 .setDepth(3).setOrigin(0).setInteractive({ useHandCursor: true })
        //                     .on('pointerover', () => {
        //                         this.savedKits[i].setFillStyle(0x000000, 1)
        //                     })
        //                     .on('pointerout', () => {
        //                         this.savedKits[i].setFillStyle(0x000000, .5)
        //                     })
        //                     .on('pointerdown', () => {
        //                         this.sampleIndex = i;
        //                         this.reloadSamples();
        //                         this.savedKits[i].setFillStyle(0xc1c1c1, 1)
        //                     })
        //                 this.savedKitText[i] = this.scene.add.text(this.savedKits[i].x + 5, this.savedKits[i].y + 5, `Kit: ${i+1}`, { fontSize: '12px', color: '#ffffff' }).setDepth(3).setOrigin(0)
        //                 ySpace += 25

        //             })
        //         } else {
        //             Object.keys(this.savedKits).forEach((eachCard)=>{
        //                 this.savedKits[eachCard].destroy()
        //             })
        //             Object.keys(this.savedKitText).forEach((eachText)=>{
        //                 this.savedKitText[eachText].destroy()
        //             })


        //         }
        //         this.showingSampleMenu = !this.showingSampleMenu

        //     })
        //     .on('pointerover', () => {
        //         this.helpText.setText("Click to toggle drum kits")
        //     })
        //     .on('pointerout', () => {
        //         this.helpText.setText("")
        //     })

        // guidelines for measures
        this.guide1 = this.scene.add.line(this.x - 15, this.y, this.x + 192, this.y + 30, this.x + 192, this.y + this.samples[this.sampleIndex].length * 35, 0x000000, 1)
            .setDepth(2).setOrigin(0).setStrokeStyle(1, 0xff0000, .25)
        this.guide2 = this.scene.add.line(this.x - 15, this.y, this.x + 112, this.y + 30, this.x + 112, this.y + this.samples[this.sampleIndex].length * 35, 0x000000, 1)
            .setDepth(2).setOrigin(0).setStrokeStyle(1, 0x000000, .25)
        this.guide3 = this.scene.add.line(this.x - 15, this.y, this.x + 272, this.y + 30, this.x + 272, this.y + this.samples[this.sampleIndex].length * 35, 0x000000, 1)
            .setDepth(2).setOrigin(0).setStrokeStyle(1, 0x000000, .25)

    }


    update() {
        if (this.volumeSlide.x < this.x - 15) {
            this.volumeSlide.x = this.x - 15
          }
      
          if (this.volumeSlide.x > this.x + this.bg.width - 12.5) {
            this.volumeSlide.x = this.x + this.bg.width - 12.5
          }
        this.pads.forEach((eachPad) => {
            eachPad.update()
        })
    }
}