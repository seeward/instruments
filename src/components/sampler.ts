import { generateColor } from "../helpers/PhaserHelpers";


export enum Pads {
    pad0 = 0,
    pad1 = 1,
    pad2 = 2,
    pad3 = 3,
    pad4 = 4,
    pad5 = 5
}

export default class CustomSampler extends Phaser.GameObjects.Container {

    pad0: Phaser.GameObjects.Rectangle;
    pad1: Phaser.GameObjects.Rectangle;
    pad2: Phaser.GameObjects.Rectangle;
    pad3: Phaser.GameObjects.Rectangle;
    pad4: Phaser.GameObjects.Rectangle;
    pad5: Phaser.GameObjects.Rectangle;
    activePad: number | undefined;
    pads: string[];
    muted: boolean = false

    constructor(scene: Phaser.Scene, x: number, y: number){
        super(scene,x,y);
        this.createSamplerControls();

        this.scene.add.existing(this);
    }

    createSamplerControls(){
        // background
        this.scene.add.rectangle(this.x, this.y, 200, 100, generateColor(), 1).setDepth(1).setOrigin(0)
                        .setStrokeStyle(3, 0x000000, 1)    
        
        // mute /  unmute
        this.scene.add.ellipse(this.x + 155, this.y + 10, 20,20, generateColor(), 1).setOrigin(0).setDepth(1)
                        .setStrokeStyle(3, 0x000000, 1).setInteractive({useHandCursor: true})
                        .on('pointerdown', ()=>{
                            this.muted ?  this.unMuteAllPads() : this.muteAllPads(); 
                            this.muted = !this.muted;
                        })

        
        this.pads = ['pad0','pad1','pad2','pad3','pad4','pad5'];
        let xPadd = 0;
        let yPadd = 0;
        let breakPoint = 2;

        // 
        this.pads.forEach((pad, i )=> {
            
            this[pad] = this.scene.add.rectangle(this.x + xPadd, this.y + yPadd, 50,50, generateColor(), 1).
            setStrokeStyle(2, 0x000000, 1).setDepth(1).setOrigin(0).setInteractive({useHandCursor: true})
            .on('pointerdown', ()=>{
                
                // this current pad is already seleted
                if(this.activePad == i){
                    console.log('into ' +  i)
                    this.activePad = undefined;
                    this[pad].setFillStyle(generateColor(), 1);
                    return;
                }

                // no pad selected -lets assign selected
                if(this.activePad === undefined){
                    this[pad].setFillStyle(0x000000, 1);
                    this.activePad = i;
                }
            })

            // adjust the spaces between pads
            if(i < breakPoint){ 
                xPadd = xPadd + 50
            } else {
                if(i == breakPoint){
                    xPadd = 0
                    yPadd = 50
                } else {
                    xPadd = xPadd + 50
                    yPadd = 50
                }
               
            }
        });
    }
    muteAllPads(){
        for(var i = 0; i < this.pads.length; i++){
            this[`pad${i}`].setFillStyle(0x00000, .5)
        }
    }
    unMuteAllPads(){
        for(var i = 0; i < this.pads.length; i++){
            this[`pad${i}`].setFillStyle(generateColor(), 1)
        }
    }


    update(){

    }

}