import { AMSynth, DuoSynth, FMSynth, Freeverb, immediate, Loop, MembraneSynth, MetalSynth, NoiseSynth, now, Pattern, Player, PluckSynth, PolySynth, Recorder, Reverb, Sequence, start, Transport } from "tone";
import { generateColor } from '../helpers/PhaserHelpers';
import CustomRecorder from "./recorder";

export enum loopPatterns {
    sixteenths = '16n',
    quarters = '4n',
    eighths = '8n',
    whole = '1n',
    eighthtriplet = '8t',
    sixtheenthtriplet = '16n'
}

export enum Pads {
    kick = 1,
    hat = 2,
    snare = 3,
    ride = 4
}

export default class Sampler extends Phaser.GameObjects.Container {

    kickPad: Phaser.GameObjects.Rectangle;
    snarePad: Phaser.GameObjects.Rectangle;
    hat1Pad: Phaser.GameObjects.Rectangle;
    hat2Pad: Phaser.GameObjects.Rectangle;
    ridePad: Phaser.GameObjects.Rectangle;
    kickPlayer: MembraneSynth;
    snarePlayer: DuoSynth;
    hatPlayer: PluckSynth;
    ridePlayer: AMSynth;
    kickLoop: number;
    selectedPad: Pads;
    snareLoop: Sequence;
    hatLoop: Sequence;
    rideLoop: Sequence;
    kickText: Phaser.GameObjects.Text;
    snareText: Phaser.GameObjects.Text;
    hatText: Phaser.GameObjects.Text;
    rideText: Phaser.GameObjects.Text;
    kickStarter: Phaser.GameObjects.Rectangle;
    snareStarter: Phaser.GameObjects.Rectangle;
    hatStarter: Phaser.GameObjects.Rectangle;
    recorder: CustomRecorder
    helpText: Phaser.GameObjects.Text;
    notes: string[];
    currentNoteIndex: number = 0;


    constructor(scene: Phaser.Scene, x: number, y: number, helpText?: Phaser.GameObjects.Text, recorder?: CustomRecorder) {
        super(scene, x, y);
        this.recorder = recorder
        this.helpText = helpText ? helpText : null
        this.initDrumSounds();
        this.makeDrumControls();
        this.makeGrooveControls()
        let self = this
        this.notes = ["C2","C2","F2","G2"]

        // this.kickLoop = new Loop((time) => {
        //     t = time
        //     self.kickPlayer.triggerAttackRelease(this.notes[this.currentNoteIndex], "20hz", time);
        //     // self.kickPlayer.triggerAttackRelease(note,loopPatterns.quarters, time);
        //     if(this.currentNoteIndex +1 === this.notes.length){
        //         this.currentNoteIndex = 0
        //     } else {
        //         this.currentNoteIndex++
        //     }
        // }, loopPatterns.eighths).start(t)
        

        Transport.on('start', (time)=>{
            //this.kickLoop.start(0);
            this.currentNoteIndex  = 0
            this.kickLoop = Transport.scheduleRepeat((time)=>{
                self.kickPlayer.triggerAttackRelease(this.notes[this.currentNoteIndex], "20hz", time);
                // self.kickPlayer.triggerAttackRelease(note,loopPatterns.quarters, time);
                if(this.currentNoteIndex +1 === this.notes.length){
                    this.currentNoteIndex = 0
                } else {
                    this.currentNoteIndex++
                }
            }, 
            loopPatterns.eighths)
        })
        Transport.on('stop', ()=>{
         Transport.cancel(now())
         Transport.clear(this.kickLoop)
                //his.kickLoop.set({position: 0})
            
        })
        this.scene.add.existing(this);
    }
    initDrumSounds() {
        let verb = new Reverb(.3).toDestination();
        this.kickPlayer = new MembraneSynth({volume: -10}).toDestination().connect(verb) as MembraneSynth// new Player('/assets/kick.wav').toDestination()
        this.snarePlayer = new DuoSynth().toDestination().toDestination().chain(verb, this.recorder.getRecorder())// new Player('/assets/snare.wav').toDestination()
        this.hatPlayer = new PluckSynth().toDestination().chain(verb, this.recorder.getRecorder()) // new Player('/assets/hat1.wav').toDestination()
        this.ridePlayer = new AMSynth().toDestination().toDestination().connect(this.recorder.getRecorder())// new Player('/assets/ride.wav').toDestination()
    }
    updatePattern(pad: Pads, pattern: loopPatterns) {
        let self = this
        switch (pad) {
            case Pads.kick:
                console.log(`Updating : ${pad} to ${pattern}`)
                if (pattern) {
                // if(!self.kickLoop.disposed){
                //     //self.kickLoop.dispose()
                // }
                    // self.kickLoop = new Loop((time) => {

                    //     self.kickPlayer.triggerAttackRelease(this.notes[this.currentNoteIndex], "10hz", time);
                    //     // self.kickPlayer.triggerAttackRelease(note,loopPatterns.quarters, time);
                    //     if(this.currentNoteIndex +1 === this.notes.length){
                    //         this.currentNoteIndex = 0
                    //     } else {
                    //         this.currentNoteIndex++
                    //     }
                    // }, pattern).start(0)
                    
                }
                break;
            

        }
    }
    makeGrooveControls() {

        let grooveWrapper = this.scene.add.rectangle(this.x - 25, this.y, 25, 90, generateColor(), 1).setDepth(1).setOrigin(0).setStrokeStyle(1, 0x000000, 1)
        let grooveHelpText = this.scene.add.text(grooveWrapper.x, grooveWrapper.y - 15, '', { color: "#000000" }).setDepth(1).setOrigin(1)

        let eights = this.scene.add.ellipse(grooveWrapper.x + 7.5, grooveWrapper.y + 10, 10, 10, generateColor(), 1).setOrigin(0).setDepth(1)
            .setStrokeStyle(3, 0x000000, .5).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
                this.updatePattern(this.selectedPad, loopPatterns.eighths)
            }).on('pointerover', () => {
                this.helpText.setText("Eights")
            }).on('pointerout', () => {
                this.helpText.setText("")
            })

        let sixteenths = this.scene.add.ellipse(grooveWrapper.x + 7.5, grooveWrapper.y + 25, 10, 10, generateColor(), 1).setOrigin(0).setDepth(1)
            .setStrokeStyle(3, 0x000000, .5).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
                this.updatePattern(this.selectedPad, loopPatterns.sixteenths)
            })
            .on('pointerover', () => {

                this.helpText.setText("Sixteenths")
            }).on('pointerout', () => {
                this.helpText.setText("")

            })

        let dotttedEights = this.scene.add.ellipse(grooveWrapper.x + 7.5, grooveWrapper.y + 40, 10, 10, generateColor(), 1).setOrigin(0).setDepth(1)
            .setStrokeStyle(3, 0x000000, .5).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
                this.updatePattern(this.selectedPad, loopPatterns.eighthtriplet)
            })
            .on('pointerover', () => {
                this.helpText.setText("Dotted Eigths")
            }).on('pointerout', () => {
                this.helpText.setText("")
            })

        let quarter = this.scene.add.ellipse(grooveWrapper.x + 7.5, grooveWrapper.y + 55, 10, 10, generateColor(), 1).setOrigin(0).setDepth(1)
            .setStrokeStyle(3, 0x000000, .5).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
                this.updatePattern(this.selectedPad, loopPatterns.quarters)
            })
            .on('pointerover', () => {
                this.helpText.setText("Quarters")
            }).on('pointerout', () => {
                this.helpText.setText("")
            })
        let whole = this.scene.add.ellipse(grooveWrapper.x + 7.5, grooveWrapper.y + 70, 10, 10, generateColor(), 1).setOrigin(0).setDepth(1)
            .setStrokeStyle(3, 0x000000, .5).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
                this.updatePattern(this.selectedPad, loopPatterns.whole)
            })
            .on('pointerover', () => {
                this.helpText.setText("Whole")
            }).on('pointerout', () => {
                this.helpText.setText("")
            })



    }
    makeDrumControls() {

        let wrapper = this.scene.add.rectangle(this.x, this.y, 50, 140, generateColor(), 1)
            .setDepth(1)
            .setOrigin(0).setStrokeStyle(2, 0x000000, 1);

        // let controlWrapper = this.scene.add.rectangle(wrapper.x, wrapper.y - 13, 50, 12.5, generateColor(), 1).setDepth(1).setOrigin(0)
        //     .setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0x000000, 1)
        //     .on('pointerdown', () => {
        //         if (Transport.state === 'stopped') {
        //             Transport.start();
        //             controlText.setText("STOP")
        //         } else {
        //             Transport.stop();
        //             controlText.setText("PLAY")
        //         }
        //     })

        // let controlText = this.scene.add.text(controlWrapper.x + 12.5, controlWrapper.y + 3, "PLAY", { color: "#000000", fontSize: '9px' }).setDepth(1).setOrigin(0)

        this.kickPad = this.scene.add.rectangle(wrapper.x + 5, wrapper.y + 5, wrapper.width - 10, 40, generateColor(), 1)
            .setInteractive({ useHandCursor: true }).setDepth(1).setOrigin(0).setStrokeStyle(2, 0x000000, 1)
            .on('pointerover', () => {
                this.helpText.setText("Pattern #1")            })
            .on('pointerout', () => {
              
            })
            .on('pointerdown', () => {

                if (this.selectedPad === Pads.kick) {
                    this.selectedPad = undefined
                    this.kickPad.setFillStyle(generateColor(), 1)
                    return
                }

                if (this.selectedPad !== Pads.hat && this.selectedPad !== Pads.ride && this.selectedPad !== Pads.snare) {
                    this.selectedPad = Pads.kick;
                    this.kickPad.setFillStyle(0x000000, 1)
                }


            })
        this.kickStarter = this.scene.add.rectangle(this.kickPad.x + 55, this.kickPad.y + 15, 10, 10, generateColor(), 1).setInteractive({ useHandCursor: true })
            .setDepth(1).setOrigin(1).setStrokeStyle(2, 0x000000, 1)
            .on('pointerdown', () => {
                // if (this.kickLoop.state !== 'started') {
                //     this.kickPlayer.set({volume: -90})
                //     this.kickStarter.setFillStyle(generateColor(), 1)
                //     this.selectedPad = undefined
                // } else {
                //     this.kickPlayer.set({volume: 0})
                //     this.kickStarter.setFillStyle(0x000000, 1)
                // }
            })

        // this.snarePad = this.scene.add.rectangle(wrapper.x + 5, wrapper.y + 50, wrapper.width - 10, 40, generateColor(), 1)
        //     .setInteractive({ useHandCursor: true }).setDepth(1).setOrigin(0).setStrokeStyle(2, 0x000000, 1)
        //     .on('pointerover', () => {
        //         this.helpText.setText("Pattern #2")            })
        //     .on('pointerout', () => {
                
        //     })
        //     .on('pointerdown', () => {
        //         if (this.selectedPad === Pads.snare) {
        //             this.selectedPad = undefined
        //             this.snarePad.setFillStyle(generateColor(), 1)
        //             return
        //         }

        //         if (this.selectedPad !== Pads.hat && this.selectedPad !== Pads.ride && this.selectedPad !== Pads.kick) {
        //             this.selectedPad = Pads.snare;
        //             this.snarePad.setFillStyle(0x000000, 1)
        //         }

        //     })


        // this.snareStarter = this.scene.add.rectangle(this.snarePad.x + 55, this.snarePad.y + 15, 10, 10, generateColor(), 1).setInteractive({ useHandCursor: true })
        //     .setDepth(1).setOrigin(1).setStrokeStyle(2, 0x000000, 1)
        //     .on('pointerdown', () => {
        //         if (this.snareLoop.state !== 'started') {
        //             this.snareLoop.start()
        //             this.snareStarter.setFillStyle(generateColor(), 1)
        //             this.selectedPad = undefined
        //         } else {
        //             this.snareLoop.stop()
        //             this.snareStarter.setFillStyle(0x000000, 1)
        //         }
        //     })



        // this.hat1Pad = this.scene.add.rectangle(wrapper.x + 5, wrapper.y + 95, wrapper.width - 10, 40, generateColor(), 1)
        //     .setInteractive({ useHandCursor: true }).setDepth(1).setOrigin(0).setStrokeStyle(2, 0x000000, 1)
        //     .on('pointerover', () => {
        //         this.helpText.setText("Pattern #3")
        //     })
        //     .on('pointerout', () => {
             
        //     })
        //     .on('pointerdown', () => {
        //         if (this.selectedPad === Pads.hat) {
        //             this.selectedPad = undefined
        //             this.hat1Pad.setFillStyle(generateColor(), 1)
        //             return
        //         }
        //         if (this.selectedPad !== Pads.kick && this.selectedPad !== Pads.ride && this.selectedPad !== Pads.snare) {
        //             this.selectedPad = Pads.hat;
        //             this.hat1Pad.setFillStyle(0x000000, 1)
        //         }

        //     })

        // this.hatStarter = this.scene.add.rectangle(this.hat1Pad.x + 55, this.hat1Pad.y + 15, 10, 10, generateColor(), 1).setInteractive({ useHandCursor: true })
        //     .setDepth(1).setOrigin(1).setStrokeStyle(2, 0x000000, 1)
        //     .on('pointerdown', () => {
        //         if (this.hatLoop.state !== 'started') {
        //             this.hatLoop.start()
        //             this.hatStarter.setFillStyle(generateColor(), 1)
        //             this.selectedPad = undefined
        //         } else {
        //             this.hatLoop.stop()
        //             this.hatStarter.setFillStyle(0x000000, 1)
        //         }
        //     })



    }

    startLoop() {
        Transport.start();
    }

    stopLoop() {
        Transport.stop();
    }

    update() {

    }
}