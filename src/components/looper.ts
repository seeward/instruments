import { Loop, Transport } from "tone";
import { HighlightSpanKind } from "typescript";
import { generateColor } from "../helpers/PhaserHelpers";
import BassPatternManager from "./bassPatternManager";
import BassPlayer from "./bassPlayer";
import DrumMachine from "./drumMachine";
import PatternManager from "./patternManager";

class myRect extends Phaser.GameObjects.Rectangle {
    public pattern: string
    public patternLabel: string
    public setLabel?: (l: string) => void
}
export default class Looper extends Phaser.GameObjects.Container {

    bg: Phaser.GameObjects.Rectangle;
    drumSeqs: any = [];
    drumSeqIndex: number = 0
    zones_drums: myRect[] = [];
    zones_bass: myRect[] = [];
    bg2: Phaser.GameObjects.Rectangle;
    bassPatterns: BassPatternManager;
    drumPatterns: PatternManager;
    labelText: Phaser.GameObjects.Text[] = [];
    resetBassPatterns: Phaser.GameObjects.Ellipse;
    helpText: Phaser.GameObjects.Text;
    dragging: boolean;
    pattern: string;
    i: number;
    drumMachine: DrumMachine;
    bassPlayer: BassPlayer;
    patternLength: number = 14
    mainSequences: any[] = [];
    loop: Loop<any>;

    constructor(scene: Phaser.Scene, x: number, y: number, bassPatterns: BassPatternManager, drumPatterns: PatternManager, drumMachine: DrumMachine, bassPlayer: BassPlayer, helpText?: Phaser.GameObjects.Text) {
        super(scene, x, y)
        this.helpText = helpText
        Transport.on('start', () => {
            this.loop.start(0)
        })
        Transport.on('stop', ()=>{
           
            this.i = 0
            this.drumSeqIndex = 0
            this.loop.set({position: '00:00:00'})
        })
        this.drumMachine = drumMachine
        this.bassPlayer = bassPlayer
        this.bassPatterns = bassPatterns
        this.drumPatterns = drumPatterns
        this.makeBackground();
        this.makeControlSurface();
        this.scene.add.existing(this);
    }
    getPatterns() {
        let t = []
        this.zones_bass.forEach((eachPattern) => {
            t.push(eachPattern)
        })
        return t;
    }
    makeMainPattern(){
       this.loop = new Loop((time: number)=>{
            this.drumMachine.loadMainSeqLoop(this.drumSeqs[this.drumSeqIndex])
            this.drumSeqIndex++
       }, `1m`).start(0)
    }
    clearPatterns() {
        this.zones_bass.forEach((eachPattern) => {

            eachPattern.destroy()


        })
        this.zones_drums.forEach((eachPattern) => {

            eachPattern.destroy()


        })
        this.makeControlSurface()
    }
    addLabel(obj) {
        this.labelText[sessionStorage.getItem('currentPatternLabel')] = this.scene.add.text(obj.x + 3, obj.y + 2, obj.patternLabel, { fontSize: '12px', color: '#000000' }).setOrigin(0).setDepth(3)
    }
    removeLabel(obj) {
        console.log(obj)
        this.labelText[obj.patternLabel].destroy() //  = this.scene.add.text(obj.x + 3,obj.y + 2, obj.patternLabel, { fontSize: '12px', color: '#000000'} ).setOrigin(0).setDepth(3)

    }
    loadSequences(){
        // this.zones_bass.forEach((eachBassPattern)=>{
        //     console.log(localStorage.getItem(eachBassPattern.pattern))
        // })
        this.zones_drums.forEach((eachBassPattern)=>{
            //console.log(localStorage.getItem(eachBassPattern.pattern))

            if(localStorage.getItem(eachBassPattern.pattern)){
                let parts = JSON.parse(localStorage.getItem(eachBassPattern.pattern))
                console.log(parts)
                this.drumSeqs.push(parts)
                // this.drumMachine.loadMainSeqLoop(parts)
            }
            
        })

        this.makeMainPattern();
    }
    makeBackground() {
        this.bg = this.scene.add.rectangle(this.x, this.y, 705, 55, generateColor(), 1)
            .setOrigin(0).setDepth(3)
        this.bg2 = this.scene.add.rectangle(this.x, this.y + 60, 705, 25, generateColor(), 1)
            .setOrigin(0).setDepth(3)
    }
    makeControlSurface() {

        let xSpace = 5
        for (var i = 0; i < 14; i++) {
            let t = this.scene.add.rectangle(this.x + xSpace, this.y + 5, 45, 45, 0xc1c1c1, .5)
                .setOrigin(0).setDepth(3).setInteractive()
                .setStrokeStyle(1, 0x000000, 1)
                .on('pointerdown', ()=>{
                    this.loadSequences()
                })
                .on('pointerover', () => {
                    console.log('into pointerover')
                    console.log(sessionStorage.getItem('currentPattern'))
                    let pointer = this.scene.input.activePointer;
                    if (pointer.isDown && sessionStorage.getItem('currentPattern')) {
                        let patternCheck = sessionStorage.getItem('currentPattern').split("_")[0] === 'ORIGINAL'
                        console.log(patternCheck)
                        if (patternCheck) {

                            t.pattern = sessionStorage.getItem('currentPattern')
                            t.patternLabel = sessionStorage.getItem('currentPatternLabel')
                            console.log(t)
                            this.addLabel(t)
                            t.setStrokeStyle(3, 0x000000, 1)
                        }
                    }

                }) as myRect
            // .on('pointerout', () => {

            //     sessionStorage.removeItem('currentPattern')
            //     sessionStorage.removeItem('currentPatternLabel')
            //     t.setStrokeStyle(1, 0x000000, 1)
            // }) as myRect
            this.zones_drums.push(t)
            xSpace += 50
        }





        this.resetBassPatterns = this.scene.add.ellipse(this.x - 25, this.y, 20, 20, generateColor(), 1).setOrigin(0).setDepth(3)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.clearPatterns()
            })
            .on('pointerover', () => {
                this.helpText.setText('Reset Bass Sequences')

            })
            .on('pointerout', () => {
                this.helpText.setText('')
            })



        let xSpace2 = 5
        for (var i = 0; i < 14; i++) {
            let t2 = this.scene.add.rectangle(this.x + xSpace2, this.y + 60, 45, 20, 0xc1c1c1, .5).setOrigin(0).setDepth(3)
                .setStrokeStyle(1, 0x000000, 1).setInteractive()
                .on('pointerover', () => {

                    let pointer = this.scene.input.activePointer;

                    if (pointer.isDown && sessionStorage.getItem('currentPattern')) {

                        console.log(sessionStorage.getItem('currentPattern'))
                        let patternCheck = sessionStorage.getItem('currentPattern').split("_")[0] === 'BASS'
                        console.log(patternCheck)
                        if (patternCheck) {
                            t2.pattern = sessionStorage.getItem('currentPattern')
                            t2.patternLabel = sessionStorage.getItem('currentPatternLabel')
                            console.log(t2)
                            this.addLabel(t2)
                            t2.setStrokeStyle(3, 0x000000, 1)
                        }
                        // this.removeLabel(t)

                    }

                }) as myRect
                // .on('pointerout', () => {

                //     sessionStorage.removeItem('currentPattern')
                //     sessionStorage.removeItem('currentPatternLabel')
                //     t2.setStrokeStyle(1, 0x000000, 1)
                // }) as myRect
            this.scene.physics.add.existing(t2)

            this.zones_bass.push(t2)
            xSpace2 += 50
        }


    }

    update() {

    }
}