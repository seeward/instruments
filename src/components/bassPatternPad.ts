import { generateColor } from "../helpers/PhaserHelpers";
import BassPlayer from "./bassPlayer";
import DrumMachine from "./drumMachine";
import PatternPad from "./patternPad";
import 'phaser'
import DashboardScene from "../scenes/main";

export default class BasePatternPad extends PatternPad {
    pad: Phaser.GameObjects.Rectangle;
    helpText: Phaser.GameObjects.Text;
    logText: Phaser.GameObjects.Text;
    hasPattern: boolean = false;
    drumMachine: DrumMachine;
    pattern: string
    showingSavedPatterns: boolean = false;
    savedCards: any = {};
    savedText: any = {};
    labelText: Phaser.GameObjects.Text;
    bassPlayer: BassPlayer;
    i: number
    copy: Phaser.GameObjects.Rectangle = undefined;
    dragging: boolean;

    constructor(scene: Phaser.Scene, x: number, y: number, drumMachine?: BassPlayer, helpText?: Phaser.GameObjects.Text, logText?: Phaser.GameObjects.Text, i?: number) {
        super(scene, x, y)
        this.i = i
        this.bassPlayer = drumMachine;
        this.helpText = helpText
        this.logText = logText
        this.createPadControl();
        this.scene.add.existing(this);
    }
    loadSavedKeys() {
        // console.log(Object.keys(localStorage))
        return Object.keys(localStorage).filter((eachKey) => {

            return eachKey.split('_')[0] === 'BASS'
        }

        )
    }
    sendPart() {
        this.bassPlayer.loadSeq(this.pattern)
    }
    clearPattern() {
        this.hasPattern = false
        if(this.labelText){
            this.labelText.setText('')
        }
        
    }
    setDragging() {
        if (!this.dragging && this.pattern) {
            this.dragging = !this.dragging;
            sessionStorage.setItem('currentPattern', this.pattern)
            sessionStorage.setItem('currentPatternLabel', (this.i + 1).toString())
            // this.copy = this.copy ? this.copy : Phaser.Utils.Objects.DeepCopy(this.pad) as Phaser.GameObjects.Rectangle
        }
    }
    getPad() {
        return this.pad
    }
    createPadControl() {
        this.pad = this.scene.add.rectangle(this.x, this.y, 25, 25, generateColor(), 1)
            .setOrigin(0).setDepth(3).setInteractive({ useHandCursor: true, draggable: true }).setStrokeStyle(2, 0xc1c1c1, .75)
            .on('drag', (pointer: any, gameObject: Phaser.GameObjects.Rectangle, dragY: number, dragX: number) => {
                this.setDragging()
                if (this.dragging) {
                    this.pad.setX(pointer.x)
                    this.pad.setY(pointer.y)
                }
            })
            .on('dragend', (pointer: any, gameObject: Phaser.GameObjects.Rectangle, dragY: number, dragX: number) => {
                console.log(pointer.x)
                this.dragging = false
                this.pad.destroy()
                this.createPadControl()
            })
            .on('pointerdown', () => {
                if (!this.hasPattern) {

                    if (!this.showingSavedPatterns) {

                        let savedPatterns = this.loadSavedKeys();

                        if (savedPatterns.length > 0) {

                            this.savedCards['holder'] = this.scene.add.rectangle(this.x + 20, this.y, 200, + savedPatterns.length * 25, generateColor(), 1)
                                .setStrokeStyle(3, 0x000000, 1)
                                .setDepth(4).setOrigin(0)
                            let ySpace = 0;
                            savedPatterns.forEach((eachPattern, i) => {
                                this.savedCards[i] = this.scene.add.rectangle(this.x + 20, this.y + ySpace, 200, 25, 0x000000, .5)
                                    .setDepth(4).setOrigin(0).setInteractive({ useHandCursor: true })
                                    .on('pointerover', () => {
                                        this.savedCards[i].setFillStyle(0x000000, 1)
                                    })
                                    .on('pointerout', () => {
                                        this.savedCards[i].setFillStyle(0x000000, .5)
                                        // t.destroy()
                                        // tText.destroy()
                                    })
                                    .on('pointerdown', () => {
                                        this.pattern = eachPattern
                                        this.hasPattern = true
                                        this.savedCards[i].setFillStyle(0xc1c1c1, 1)
                                        this.labelText = this.scene.add.text(this.x + 5, this.y + 5, (this.i + 1).toString(), { fontSize: '14px', color: '#000000' })
                                            .setOrigin(0).setDepth(4).setAlpha(1)
                                        Object.keys(this.savedCards).forEach((eachCard) => {
                                            this.savedCards[eachCard].destroy()
                                        })

                                        Object.keys(this.savedText).forEach((eachText) => {
                                            this.savedText[eachText].destroy()
                                        })
                                        this.showingSavedPatterns = false
                                        // t.destroy()
                                        // tText.destroy()
                                    })

                                this.savedText[i] = this.scene.add.text(this.savedCards[i].x + 5, this.savedCards[i].y + 5, eachPattern.split('_')[1], { fontSize: '12px', color: '#ffffff' }).setDepth(4).setOrigin(0)

                                ySpace += 25

                            })
                        } else {
                            this.helpText.setText('Save some bass patterns first')
                        }

                    } else {
                        Object.keys(this.savedCards).forEach((eachCard) => {
                            this.savedCards[eachCard].destroy()
                        })

                        Object.keys(this.savedText).forEach((eachText) => {
                            this.savedText[eachText].destroy()
                        })
                    }
                    this.showingSavedPatterns = !this.showingSavedPatterns

                } else {
                    this.pad.setFillStyle(generateColor(), 1)
                    this.sendPart();
                }

            })
            .on('pointerover', () => {
                if (this.hasPattern) {
                    this.helpText.setText(`Click to load bass pattern: ${this.pattern.split('_')[1]}`)
                } else {
                    this.helpText.setText('Click to add bass pattern to this pad')
                }

            })
            .on('pointerout', () => {
                // if(this.pad){
                //     this.pad.destroy()
                //     this.dragging = false
                // }

                this.helpText.setText('')
            })

        this.scene.physics.add.existing(this.pad)
    }
    update() {

    }
}