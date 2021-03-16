import 'phaser'
import { generateColor } from '../helpers/PhaserHelpers';
import { MonoSynth } from 'tone';
import BassPad from './bassPad';
import { mapRanges } from '../helpers/PhaserHelpers'
import { SavedSequence } from './drumMachine';
import MachineMusicMan, { MLModels, ModelCheckpoints } from './mlmusician';
export default class BassPlayer extends Phaser.GameObjects.Container {

    bg: Phaser.GameObjects.Rectangle;
    synth: MonoSynth;
    notes: string[] = ['C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'B2', 'C3'].reverse();
    helpText: Phaser.GameObjects.Text;
    pads: BassPad[] = [];
    resetButton: Phaser.GameObjects.Rectangle;
    volumeLine: Phaser.GameObjects.Rectangle;
    volumeSlide: Phaser.GameObjects.Ellipse;
    controlBG: Phaser.GameObjects.Rectangle;
    attack: Phaser.GameObjects.Rectangle;
    decay: Phaser.GameObjects.Rectangle;
    release: Phaser.GameObjects.Rectangle;
    sustain: Phaser.GameObjects.Rectangle;
    savedSeq: SavedSequence[];
    patternLoaded: boolean;
    aiButtonBG: Phaser.GameObjects.Rectangle;
    aiButton: Phaser.GameObjects.Rectangle;
    generatedPattern: any[];
    mlPatternGenerator: MachineMusicMan;

    constructor(scene: Phaser.Scene, x: number, y: number, helpText?: Phaser.GameObjects.Text, logText?: Phaser.GameObjects.Text) {
        super(scene, x, y);
        this.mlPatternGenerator = new MachineMusicMan(MLModels.VAE, ModelCheckpoints.MelodyVAE, this.helpText, logText);
        this.setHelpText(helpText);
        this.makeControlSurface();
        this.attachSynth();
        this.makeSeqPads();
        this.addVolumeControls();
        this.scene.add.existing(this);
    }
    async getSeedLoop() {
        console.log('1')
        if (this.mlPatternGenerator.isInitialised()) {
            console.log('2')

            const seed = []
            const finalConvertedSeed = []
            // get the current sequence from each pad
            this.pads.forEach((eachPad, i) => {
                seed.push(eachPad.getSequence())
            })
            console.log(seed)

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
            console.log('3')

            // call our ML model 
            let newPart = await this.mlPatternGenerator.sampleModel(1);
            console.log(newPart)
            // check our results
            let newSequences = [];
            // if we got a new model as an array 
            if (Array.isArray(newPart)) {
                // break up the output from the ml model 
                this.pads.forEach((eachPad, i) => {

                    newPart.forEach((eachStep: any, stepIndx: number) => {
                        console.log(eachStep)
                    });

                })
                console.log(newSequences)

                this.generatedPattern = newSequences;
                // load the AI beat into the drum pads
                this.loadGeneratedLoop(this.generatedPattern);

            }
        }

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
    getSynth() {
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
        let shadow = this.scene.add.rectangle(this.x + 293, this.y + 13, 105, 130, 0x000000, .75)
            .setOrigin(0).setDepth(1)
        this.controlBG = this.scene.add.rectangle(this.x + 290, this.y + 10, 105, 130, generateColor(), 1)
            .setOrigin(0).setDepth(2).setStrokeStyle(2, 0x0000, 1);


        this.attack = this.scene.add.rectangle(this.x + 305, this.y + 25, 15, 5, 0x00000, 1)
            .setDepth(3).setOrigin(0).setInteractive({ draggable: true, useHandCursor: true }).setStrokeStyle(2, 0x000000, 1)
            .on('drag', (pointer: any, gameObject: Phaser.GameObjects.Rectangle, dragY: number, dragX: number) => {
                let y = Math.floor(pointer.y - this.y)

                console.log(y)
                if (y < 25) {
                    y = 25
                }
                if (y > 125) {
                    y = 125
                }
                let Y = mapRanges(y, 25, 125, .001, 1)
                this.helpText.setText(Y.toFixed(2) + " secs attack")
                this.synth.set({ envelope: { attack: Y } })
                this.attack.setY(y + this.y)
            })
            .on('pointerover', () => {
                this.helpText.setText("Attack")
            })
            .on('pointerout', () => {
                this.helpText.setText("")
            })

        let bar1 = this.scene.add.rectangle(this.attack.x + this.attack.width / 2, this.attack.y, 2, 100, 0x000000, .5).setOrigin(0)
            .setDepth(2)

        this.decay = this.scene.add.rectangle(this.x + 325, this.y + 25, 15, 5, 0x00000, 1)
            .setDepth(3).setOrigin(0).setInteractive({ draggable: true, useHandCursor: true }).setStrokeStyle(2, 0x000000, 1)
            .on('drag', (pointer: any, gameObject: Phaser.GameObjects.Rectangle, dragY: number, dragX: number) => {
                let y = Math.floor(pointer.y - this.y)

                console.log(y)
                if (y < 25) {
                    y = 25
                }
                if (y > 125) {
                    y = 125
                }
                let Y = mapRanges(y, 25, 125, .1, .9)
                this.helpText.setText(Y.toFixed(2) + " secs decay")
                this.synth.set({ envelope: { decay: Y } })
                this.decay.setY(y + this.y)
            })
            .on('pointerover', () => {
                this.helpText.setText("Decay")
            })
            .on('pointerout', () => {
                this.helpText.setText("")
            })

        let bar4 = this.scene.add.rectangle(this.decay.x + this.decay.width / 2, this.decay.y, 2, 100, 0x000000, .5).setOrigin(0)
            .setDepth(2)

        this.release = this.scene.add.rectangle(this.x + 345, this.y + 25, 15, 5, 0x00000, 1)
            .setDepth(3).setOrigin(0).setInteractive({ draggable: true, useHandCursor: true }).setStrokeStyle(2, 0x000000, 1)
            .on('drag', (pointer: any, gameObject: Phaser.GameObjects.Rectangle, dragY: number, dragX: number) => {
                let y = Math.floor(pointer.y - this.y)

                console.log(y)
                if (y < 25) {
                    y = 25
                }
                if (y > 125) {
                    y = 125
                }
                let Y = mapRanges(y, 25, 125, 0, 5)
                this.helpText.setText(Y.toFixed(2) + " secs release")
                this.synth.set({ envelope: { release: Y } })
                this.release.setY(y + this.y)
            })
            .on('pointerover', () => {
                this.helpText.setText("Release")
            })
            .on('pointerout', () => {
                this.helpText.setText("")
            })

        let bar2 = this.scene.add.rectangle(this.release.x + this.release.width / 2, this.release.y, 2, 100, 0x000000, .5).setOrigin(0)
            .setDepth(2)



        this.sustain = this.scene.add.rectangle(this.x + 365, this.y + 25, 15, 5, 0x00000, 1)
            .setDepth(3).setOrigin(0).setInteractive({ draggable: true, useHandCursor: true }).setStrokeStyle(2, 0x000000, 1)
            .on('drag', (pointer: any, gameObject: Phaser.GameObjects.Rectangle, dragY: number, dragX: number) => {
                let y = Math.floor(pointer.y - this.y)

                console.log(y)
                if (y < 25) {
                    y = 25
                }
                if (y > 125) {
                    y = 125
                }
                let Y = mapRanges(y, 25, 125, 0, 1)
                this.helpText.setText(Y.toFixed(2) + " sustain")
                this.synth.set({ envelope: { sustain: Y } })
                this.sustain.setY(y + this.y)
            })
            .on('pointerover', () => {
                this.helpText.setText("Sustain")
            })
            .on('pointerout', () => {
                this.helpText.setText("")
            })

        let bar3 = this.scene.add.rectangle((this.sustain.x + this.sustain.width / 2), this.sustain.y, 2, 100, 0x000000, .5).setOrigin(0)
            .setDepth(2)

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

        this.aiButtonBG = this.scene.add.rectangle(this.x + 410, this.y + 45, 35, 35, generateColor())
            .setDepth(3).setOrigin(0).setStrokeStyle(1, 0x000000, 1)
            
            
        let aiBtnShadow = this.scene.add.ellipse(this.x + 419, this.y + 53, 20, 20, 0x000000, .5)
            .setDepth(3).setOrigin(0) 
        this.aiButton = this.scene.add.ellipse(this.x + 417, this.y + 50, 20, 20, generateColor())
            .setDepth(3).setOrigin(0).setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0x000000, 1)
            .on('pointerdown', () => {
                this.saveSeq();
            })
            .on('pointerover', () => {

                this.helpText.setText("Save Bass pattern");

            })
            .on('pointerout', () => {
                this.helpText.setText("")
            })
            // let AIText = this.scene.add.text(this.aiButton.x + 4, this.aiButton.y + 5, 'AI', {fontSize:'10px', color: '#000000'})
            // .setDepth(3).setOrigin(0)


        let hori1 = this.scene.add.rectangle(this.x + 77, this.y + 15, 1, 130, 0x000000, .25).setOrigin(0)
            .setDepth(2)
        let hori2 = this.scene.add.rectangle(this.x + 137, this.y + 10, 1, 135, 0xff0000, .25).setOrigin(0)
            .setDepth(2)
        let hori3 = this.scene.add.rectangle(this.x + 197, this.y + 15, 1, 130, 0x000000, .25).setOrigin(0)
            .setDepth(2)
    }
    clearAll() {
        console.log('clearing all')
        this.pads.forEach((eachPad) => {

            eachPad.clear()
        })
    }
    saveSeq() {

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
            let name = prompt("Saved Pattern label - 5 characters");
            if (name) {
                this.savedSeq = this.pads.map((eachPad) => {
                    return {
                        seqData: eachPad.getSequence()
                    }
                })
                localStorage.setItem(`BASS_${name.substring(0, 5)}`, JSON.stringify(this.savedSeq))
            }
        } else {
            this.helpText.setText("You must first edit the bass pattern to save it")
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

            return eachKey.split('_')[0] === 'BASS'
        }

        )
    }
    loadGeneratedLoop(savedSeq) {
        this.helpText.setText("AI generated bass line loaded")
        this.pads.forEach((eachPad, i) => {
            // console.log(savedSeq[i])
            if (savedSeq[i]) {
                eachPad.setSequence(savedSeq[i])
            }

        });
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

