import { generateColor } from "../helpers/PhaserHelpers";
import BassPlayer from "./bassPlayer";
import DrumMachine from "./drumMachine";
import PatternPad from "./patternPad";


export default class BasePatternPad extends PatternPad {
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
    bassPlayer: BassPlayer;

    constructor(scene: Phaser.Scene, x: number, y: number, drumMachine?: BassPlayer, helpText?: Phaser.GameObjects.Text, logText?: Phaser.GameObjects.Text) {
        super(scene, x, y)
        this.bassPlayer = drumMachine;
        this.helpText = helpText
        this.logText = logText
        this.createPadControl()
        this.scene.add.existing(this);

    }
    loadSavedKeys() {
        // console.log(Object.keys(localStorage))
        return Object.keys(localStorage).filter((eachKey) => {

            return eachKey.split('_')[0] === 'BASS'
        }

        )
    }
    sendPart(){
        this.bassPlayer.loadSeq(this.pattern)
    }
    clearPattern(){
        this.hasPattern = false
        this.labelText.setText('')
    }
    createPadControl(){
        this.pad = this.scene.add.rectangle(this.x,this.y, 25,25, generateColor(), .5)
        .setOrigin(0).setDepth(2).setInteractive({useHandCursor: true}).setStrokeStyle(2, 0xffffff, .75)
        .on('pointerdown', () => {
            if(!this.hasPattern){
                
                if (!this.showingSavedPatterns) {
                    
                    let savedPatterns = this.loadSavedKeys();
                    
                    if(savedPatterns.length > 0){
                        
                        this.savedCards['holder'] = this.scene.add.rectangle(this.x + 20, this.y, 200, + savedPatterns.length * 25, generateColor(), 1)
                        .setStrokeStyle(3, 0x000000, 1)
                        .setDepth(2).setOrigin(0)
                    let ySpace = 0;
                        savedPatterns.forEach((eachPattern, i) => {
                            this.savedCards[i] = this.scene.add.rectangle(this.x + 20, this.y + ySpace, 200, 25, 0x000000, .5)
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
                                    this.pattern = eachPattern
                                    this.hasPattern = true
                                    this.savedCards[i].setFillStyle(0xc1c1c1, 1)
                                    this.labelText = this.scene.add.text(this.x + 5, this.y +5, this.pattern.split('_')[1], {fontSize: '8px', color: '#000000'})
                                    .setOrigin(0).setDepth(3).setAlpha(1)
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
    
                            this.savedText[i] = this.scene.add.text(this.savedCards[i].x + 5, this.savedCards[i].y + 5, eachPattern.split('_')[1], { fontSize: '12px', color: '#ffffff' }).setDepth(3).setOrigin(0)
    
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
            if(this.hasPattern){
                this.helpText.setText(`Click to load bass pattern: ${this.pattern.split('_')[1]}`)
            } else {
                this.helpText.setText('Click to add bass pattern to this pad')
            }
            
        })
        .on('pointerout', () => {
            this.helpText.setText('')
        })
    }
    update(){

    }
}