import { Freeverb, Loop, MembraneSynth, MetalSynth, NoiseSynth, Player, Recorder, Reverb, start, Transport } from "tone";
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

export default class Drums extends Phaser.GameObjects.Container {

    kickPad: Phaser.GameObjects.Rectangle;
    snarePad: Phaser.GameObjects.Rectangle;
    hat1Pad: Phaser.GameObjects.Rectangle;
    hat2Pad: Phaser.GameObjects.Rectangle;
    ridePad: Phaser.GameObjects.Rectangle;
    kickPlayer: MembraneSynth;
    snarePlayer: NoiseSynth;
    hatPlayer: MetalSynth;
    ridePlayer: MetalSynth;
    kickLoop: any;
    selectedPad: Pads;
    snareLoop: any;
    hatLoop: any;
    rideLoop: any;
    kickText: Phaser.GameObjects.Text;
    snareText: Phaser.GameObjects.Text;
    hatText: Phaser.GameObjects.Text;
    rideText: Phaser.GameObjects.Text;
    kickStarter: Phaser.GameObjects.Rectangle;
    snareStarter: Phaser.GameObjects.Rectangle;
    hatStarter: Phaser.GameObjects.Rectangle;
    recorder: CustomRecorder


    constructor(scene: Phaser.Scene, x: number, y: number, recorder: CustomRecorder) {
        super(scene, x, y);
        this.recorder = recorder

        this.initDrumSounds();
        this.makeDrumControls();
        this.makeGrooveControls()
        
        
        
        this.kickLoop = new Loop((time) => {
            this.kickPlayer.triggerAttackRelease('C0', '2n');
        }, loopPatterns.quarters).start() 
        this.snareLoop = new Loop((time) => {
            this.snarePlayer.triggerAttackRelease('8n');
        }, loopPatterns.whole).start()
        this.hatLoop = new Loop((time) => {
            this.hatPlayer.triggerAttackRelease('C4', .010);
        }, loopPatterns.eighths).start()
        // this.rideLoop = new Loop((time) => {
        //     //this.ridePlayer.start()
        // }, loopPatterns.quarters).start()

        this.scene.add.existing(this);
    }
    initDrumSounds() {
        let verb = new Reverb(.3).toDestination();
        this.kickPlayer = new MembraneSynth().toDestination().chain(verb,this.recorder.getRecorder()) as MembraneSynth// new Player('/assets/kick.wav').toDestination()
        this.snarePlayer = new NoiseSynth().toDestination().toDestination().chain(verb, this.recorder.getRecorder())// new Player('/assets/snare.wav').toDestination()
        this.hatPlayer = new MetalSynth({ volume: -30 }).toDestination().chain(verb, this.recorder.getRecorder()) // new Player('/assets/hat1.wav').toDestination()
        this.ridePlayer = new MetalSynth().toDestination().toDestination().connect(this.recorder.getRecorder())// new Player('/assets/ride.wav').toDestination()
    }
    updatePattern(pad: Pads, pattern: loopPatterns) {
        switch (pad) {
            case Pads.kick:
                console.log(`Updating : ${pad} to ${pattern}`)
                if (pattern) {
                    this.kickLoop.stop()
                    this.kickLoop = new Loop((time) => {
                        this.kickPlayer.triggerAttackRelease('C0', '2n');
                    }, pattern).start()
                }
                break;
            case Pads.snare:
                if (pattern) {
                    this.snareLoop.stop()
                    this.snareLoop = new Loop((time) => {
                        this.snarePlayer.triggerAttackRelease('8n');
                    }, pattern).start()
                }
                break;
            case Pads.hat:
                if (pattern) {
                    this.hatLoop.stop()
                    this.hatLoop = new Loop((time) => {
                        this.hatPlayer.triggerAttackRelease('C4', 0.010);
                    }, pattern).start()
                }
                break;
            case Pads.ride:
                if (pattern) {
                    this.rideLoop.stop()
                    this.rideLoop = new Loop((time) => {
                        // this.ridePlayer.start()
                    }, pattern).start()
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
                grooveHelpText.setText("Eights")
            }).on('pointerout', () => {
                grooveHelpText.setText("")
            })

        let sixteenths = this.scene.add.ellipse(grooveWrapper.x + 7.5, grooveWrapper.y + 25, 10, 10, generateColor(), 1).setOrigin(0).setDepth(1)
            .setStrokeStyle(3, 0x000000, .5).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
                this.updatePattern(this.selectedPad, loopPatterns.sixteenths)
            })
            .on('pointerover', () => {

                grooveHelpText.setText("Sixteenths")
            }).on('pointerout', () => {
                grooveHelpText.setText("")

            })

        let dotttedEights = this.scene.add.ellipse(grooveWrapper.x + 7.5, grooveWrapper.y + 40, 10, 10, generateColor(), 1).setOrigin(0).setDepth(1)
            .setStrokeStyle(3, 0x000000, .5).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
                this.updatePattern(this.selectedPad, loopPatterns.eighthtriplet)
            })
            .on('pointerover', () => {
                grooveHelpText.setText("Dotted Eigths")
            }).on('pointerout', () => {
                grooveHelpText.setText("")
            })

        let quarter = this.scene.add.ellipse(grooveWrapper.x + 7.5, grooveWrapper.y + 55, 10, 10, generateColor(), 1).setOrigin(0).setDepth(1)
            .setStrokeStyle(3, 0x000000, .5).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
                this.updatePattern(this.selectedPad, loopPatterns.quarters)
            })
            .on('pointerover', () => {
                grooveHelpText.setText("Quarters")
            }).on('pointerout', () => {
                grooveHelpText.setText("")
            })
        let whole = this.scene.add.ellipse(grooveWrapper.x + 7.5, grooveWrapper.y + 70, 10, 10, generateColor(), 1).setOrigin(0).setDepth(1)
            .setStrokeStyle(3, 0x000000, .5).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
                this.updatePattern(this.selectedPad, loopPatterns.whole)
            })
            .on('pointerover', () => {
                grooveHelpText.setText("Whole")
            }).on('pointerout', () => {
                grooveHelpText.setText("")
            })



    }
    makeDrumControls() {

        let wrapper = this.scene.add.rectangle(this.x, this.y, 50, 140, generateColor(), 1)
            .setDepth(1)
            .setOrigin(0).setStrokeStyle(2, 0x000000, 1);

        let controlWrapper = this.scene.add.rectangle(wrapper.x, wrapper.y - 13, 50, 12.5, generateColor(), 1).setDepth(1).setOrigin(0)
            .setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0x000000, 1)
            .on('pointerdown', () => {
                if (Transport.state === 'stopped') {
                    Transport.start();
                    controlText.setText("STOP")
                } else {
                    Transport.stop();
                    controlText.setText("PLAY")
                }
            })

        let controlText = this.scene.add.text(controlWrapper.x + 12.5, controlWrapper.y + 3, "PLAY", { color: "#000000", fontSize: '9px' }).setDepth(1).setOrigin(0)

        this.kickPad = this.scene.add.rectangle(wrapper.x + 5, wrapper.y + 5, wrapper.width - 10, 40, generateColor(), 1)
            .setInteractive({ useHandCursor: true }).setDepth(1).setOrigin(0).setStrokeStyle(2, 0x000000, 1)
            .on('pointerover', () => {
                this.kickText = this.scene.add.text(this.kickPad.x + 5, this.kickPad.y + 5, "KICK", { fontSize: '10px', color: "#000000" }).setDepth(1).setOrigin(0)
            })
            .on('pointerout', () => {
                this.kickText.destroy()
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
                if (this.kickLoop.state !== 'started') {
                    this.kickLoop.start()
                    this.kickStarter.setFillStyle(generateColor(), 1)
                    this.selectedPad = undefined
                } else {
                    this.kickLoop.stop()
                    this.kickStarter.setFillStyle(0x000000, 1)
                }
            })

        this.snarePad = this.scene.add.rectangle(wrapper.x + 5, wrapper.y + 50, wrapper.width - 10, 40, generateColor(), 1)
            .setInteractive({ useHandCursor: true }).setDepth(1).setOrigin(0).setStrokeStyle(2, 0x000000, 1)
            .on('pointerover', () => {
                this.snareText = this.scene.add.text(this.snarePad.x + 5, this.snarePad.y + 5, "SNARE", { fontSize: '10px', color: "#000000" }).setDepth(1).setOrigin(0)
            })
            .on('pointerout', () => {
                this.snareText.destroy()
            })
            .on('pointerdown', () => {
                if (this.selectedPad === Pads.snare) {
                    this.selectedPad = undefined
                    this.snarePad.setFillStyle(generateColor(), 1)
                    return
                }

                if (this.selectedPad !== Pads.hat && this.selectedPad !== Pads.ride && this.selectedPad !== Pads.kick) {
                    this.selectedPad = Pads.snare;
                    this.snarePad.setFillStyle(0x000000, 1)
                }

            })


        this.snareStarter = this.scene.add.rectangle(this.snarePad.x + 55, this.snarePad.y + 15, 10, 10, generateColor(), 1).setInteractive({ useHandCursor: true })
            .setDepth(1).setOrigin(1).setStrokeStyle(2, 0x000000, 1)
            .on('pointerdown', () => {
                if (this.snareLoop.state !== 'started') {
                    this.snareLoop.start()
                    this.snareStarter.setFillStyle(generateColor(), 1)
                    this.selectedPad = undefined
                } else {
                    this.snareLoop.stop()
                    this.snareStarter.setFillStyle(0x000000, 1)
                }
            })



        this.hat1Pad = this.scene.add.rectangle(wrapper.x + 5, wrapper.y + 95, wrapper.width - 10, 40, generateColor(), 1)
            .setInteractive({ useHandCursor: true }).setDepth(1).setOrigin(0).setStrokeStyle(2, 0x000000, 1)
            .on('pointerover', () => {
                this.hatText = this.scene.add.text(this.hat1Pad.x + 5, this.hat1Pad.y + 5, "HIHAT", { fontSize: '10px', color: "#000000" }).setDepth(1).setOrigin(0)
            })
            .on('pointerout', () => {
                this.hatText.destroy()
            })
            .on('pointerdown', () => {
                if (this.selectedPad === Pads.hat) {
                    this.selectedPad = undefined
                    this.hat1Pad.setFillStyle(generateColor(), 1)
                    return
                }
                if (this.selectedPad !== Pads.kick && this.selectedPad !== Pads.ride && this.selectedPad !== Pads.snare) {
                    this.selectedPad = Pads.hat;
                    this.hat1Pad.setFillStyle(0x000000, 1)
                }

            })

        this.hatStarter = this.scene.add.rectangle(this.hat1Pad.x + 55, this.hat1Pad.y + 15, 10, 10, generateColor(), 1).setInteractive({ useHandCursor: true })
            .setDepth(1).setOrigin(1).setStrokeStyle(2, 0x000000, 1)
            .on('pointerdown', () => {
                if (this.hatLoop.state !== 'started') {
                    this.hatLoop.start()
                    this.hatStarter.setFillStyle(generateColor(), 1)
                    this.selectedPad = undefined
                } else {
                    this.hatLoop.stop()
                    this.hatStarter.setFillStyle(0x000000, 1)
                }
            })

        // this.ridePad = this.scene.add.rectangle(wrapper.x + 5, wrapper.y + 140, wrapper.width  - 10, 40, generateColor(), 1)
        //     .setInteractive({ useHandCursor: true }).setDepth(1).setOrigin(0).setStrokeStyle(2,0x000000,1)
        //     .on('pointerover', ()=>{
        //         this.rideText = this.scene.add.text(this.ridePad.x +5, this.ridePad.y+5, "RIDE", { fontSize: '10px', color: "#000000"}).setDepth(1).setOrigin(0)
        //     })
        //     .on('pointerout', ()=>{
        //         this.rideText.destroy()
        //     })
        //     .on('pointerdown', () => {
        //         if(this.selectedPad !== Pads.hat && this.selectedPad !== Pads.kick && this.selectedPad !== Pads.snare){
        //             this.selectedPad = Pads.ride;
        //             Transport.stop()
        //             if (this.rideLoop.state === 'started') {
        //                 this.rideLoop.stop()
        //                 this.ridePad.setFillStyle(generateColor(),1)
        //                 this.selectedPad = undefined

        //             } else {
        //                 this.rideLoop.start()
        //                 this.ridePad.setFillStyle(0x000000,1)
        //             }
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