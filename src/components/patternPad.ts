import { generateColor } from "../helpers/PhaserHelpers";
import DrumMachine from "./drumMachine";


export default class PatternPad extends Phaser.GameObjects.Container {
    pad: Phaser.GameObjects.Rectangle;
    helpText: Phaser.GameObjects.Text;
    logText: Phaser.GameObjects.Text;
    hasPattern: boolean = false;
    drumMachine: DrumMachine;
    pattern: string
    showingSavedPatterns: boolean = false;
    savedCards: any = {};
    savedText: any ={};
    labelText: Phaser.GameObjects.Text;
    i: number
    dragging: boolean;

    constructor(scene: Phaser.Scene, x: number, y: number, drumMachine?: DrumMachine, helpText?: Phaser.GameObjects.Text, logText?: Phaser.GameObjects.Text, i?: number) {
        super(scene, x, y)
        this.i = i
        this.drumMachine = drumMachine;
        this.helpText = helpText
        this.logText = logText
        this.createPadControl()
        this.scene.add.existing(this);

    }
    loadSavedKeys() {
        // console.log(Object.keys(localStorage))
        return Object.keys(localStorage).filter((eachKey) => {

            return eachKey.split('_')[0] === 'ORIGINAL'
        }

        )
    }
    sendPart(){
        this.drumMachine.loadSeq(this.pattern)
    }
    getPad(){
        return this.pad
    }
    clearPattern(){
        this.hasPattern = false
        this.labelText.setText('')
    }
    setDragging() {
        if (!this.dragging && this.pattern) {
            this.dragging = !this.dragging;
            sessionStorage.setItem('currentPattern', this.pattern)
            sessionStorage.setItem('currentPatternLabel', (this.i + 1).toString())
            // this.copy = this.copy ? this.copy : Phaser.Utils.Objects.DeepCopy(this.pad) as Phaser.GameObjects.Rectangle
        }
    }

    createPadControl(){
        this.pad = this.scene.add.rectangle(this.x,this.y, 50,50, generateColor(), .5)
        .setOrigin(0).setDepth(4).setInteractive({useHandCursor: true, draggable: true}).setStrokeStyle(2, 0xc1c1c1, .75)
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
            if(!this.hasPattern){
                
                if (!this.showingSavedPatterns) {
                    
                    let savedPatterns = this.loadSavedKeys();
                    
                    if(savedPatterns.length > 0){
                        
                        this.savedCards['holder'] = this.scene.add.rectangle(this.x + 20, this.y, 200, + savedPatterns.length * 25, generateColor(), 1)
                        .setStrokeStyle(3, 0x000000, 1)
                        .setDepth(5).setOrigin(0)
                    let ySpace = 0;
                        savedPatterns.forEach((eachPattern, i) => {
                            this.savedCards[i] = this.scene.add.rectangle(this.x + 20, this.y + ySpace, 200, 25, 0x000000, .5)
                                .setDepth(5).setOrigin(0).setInteractive({ useHandCursor: true })
                                .on('pointerover', () => {
                                    this.savedCards[i].setFillStyle(0x000000, 1)
                                })
                                .on('pointerout', () => {
                                    this.savedCards[i].setFillStyle(0x000000, .5)
                                })
                                .on('pointerdown', () => {
                                    this.pattern = eachPattern
                                    this.hasPattern = true
                                    this.savedCards[i].setFillStyle(0xc1c1c1, 1)
                                    this.labelText = this.scene.add.text(this.x + 5, this.y +5, (this.i+1).toString(), {fontSize: '24px', color: '#000000'})
                                    .setOrigin(0).setDepth(5).setAlpha(1)
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
    
                            this.savedText[i] = this.scene.add.text(this.savedCards[i].x + 5, this.savedCards[i].y + 5, eachPattern.split('_')[1], { fontSize: '12px', color: '#ffffff' }).setDepth(5).setOrigin(0)
    
                            ySpace += 25
    
                        })
                    } else {
                        this.helpText.setText('Save some drum patterns first')
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
            if(this.hasPattern){
                this.helpText.setText(`Click to load pattern: ${this.pattern.split('_')[1]}`)
            } else {
                this.helpText.setText('Click to add drum pattern to this pad')
            }
            
        })
        .on('pointerout', () => {
            this.helpText.setText('')
        })

        this.scene.physics.add.existing(this.pad)
    }
    update(){

    }
}