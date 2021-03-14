import { AMSynth, AutoWah, Chorus, Delay, Distortion, FMSynth, MembraneSynth, MonoSynth, Phaser as _phaser, PingPongDelay, Player, PluckSynth, PolySynth, Reverb } from "tone";
import { generateColor } from "../helpers/PhaserHelpers";
import 'phaser';
import KeyBoard from "./keyboard";

export enum Pads {
    pad0 = 0,
    pad1 = 1,
    pad2 = 2,
    pad3 = 3,
    pad4 = 4,
    pad5 = 5
}

interface Connections {
    keys: string[],
    drums: string[],
    bass: string[]
}

export default class EffectControls extends Phaser.GameObjects.Container {

    pad0: Phaser.GameObjects.Rectangle;
    pad1: Phaser.GameObjects.Rectangle;
    pad2: Phaser.GameObjects.Rectangle;
    pad3: Phaser.GameObjects.Rectangle;
    pad4: Phaser.GameObjects.Rectangle;
    pad5: Phaser.GameObjects.Rectangle;
    activePad: number | undefined = undefined;
    pads: string[];
    muted: boolean = false
    effects: string[] = ['Delay', 'Distortion', 'Reverb', 'Chorus', 'Phaser', 'Autowah']
    helpText: Phaser.GameObjects.Text
    effectBG: Phaser.GameObjects.Rectangle;
    effectBGInner: Phaser.GameObjects.Rectangle;
    effectStick: Phaser.GameObjects.Rectangle;
    effectStickInner: Phaser.GameObjects.Ellipse;
    delayControl: Phaser.GameObjects.Ellipse;
    effectConnectFlag: any;
    synth: any;
    distControl: Phaser.GameObjects.Ellipse;
    distConnectFlag: any;
    dist: any;
    effectObjects: Delay | PingPongDelay | Distortion | AutoWah | Chorus | _phaser[] = [];
    keys: PluckSynth | PolySynth | FMSynth | AMSynth | MembraneSynth;
    drums: Player[];
    bass: MonoSynth;
    keysBtn: Phaser.GameObjects.Rectangle;
    connections = {
        keys: [],
        drums: [],
        bass: []
    }
    drumsBtn: Phaser.GameObjects.Rectangle;
    bassBtn: Phaser.GameObjects.Rectangle;

    constructor(scene: Phaser.Scene, x: number, y: number, drums?: Player[], bass?: MonoSynth, keys?: PluckSynth | PolySynth | FMSynth | AMSynth | MembraneSynth, helpText?: Phaser.GameObjects.Text) {
        super(scene, x, y);
        this.keys = keys
        this.drums = drums
        this.bass = bass
        this.helpText = helpText ? helpText : null
        this.createSamplerControls();
        this.initEffects();
        this.addEffectControls();
        this.scene.add.existing(this);
    }

    initEffects() {
        this.effects.forEach((eachEffect, i) => {
            switch (eachEffect) {
                case 'Delay':
                    this.effectObjects[i] = new PingPongDelay("4n", 0.2).toDestination();
                    break;
                case 'Distortion':
                    this.effectObjects[i] = new Distortion(.6).toDestination();
                    break;
                case 'Reverb':
                    this.effectObjects[i] = new Reverb({
                        decay: .3,
                        preDelay: .009,
                        wet: .2
                    }).toDestination();
                    break;
                case 'Chorus':
                    this.effectObjects[i] = new Chorus(4, 2.5, 0.5).toDestination();
                    break
                case 'Phaser':
                    this.effectObjects[i] = new _phaser({
                        frequency: 15,
                        octaves: 5,
                        baseFrequency: 1000
                    }).toDestination();
                    break;
                case 'Autowah':
                    this.effectObjects[i] = new AutoWah(50, 6, -30).toDestination();
                    break;

            }
        })

        console.log(this.effectObjects)
    }

    getBetweenZeroAndOne(val, max, min) {
        return (val - min) / (max - min);
    }
    convertXToEffectParam1(x: number) {
        // console.log(x)
        return 1 / Math.floor(x) * 10
    }
    convertYToEffectParam2(y: number) {
        console.log(y)
        return Math.floor(y) / 100
    }
    getEffectParams(eff: string){

            switch (eff) {
                case 'Delay':
                    return ['delayTime', 'wet']
                    break;
                case 'Distortion':
                    return ['distortion', 'wet']
                    break;
                case 'Reverb':
                    return ['decay', 'wet']
                    break;
                case 'Chorus':
                    return ['depth', 'wet']
                    break
                case 'Phaser':
                    return ['baseFrequency', 'wet']
                    break;
                case 'Autowah':
                    return ['sensitivity', 'wet']
                    break;

            }  
        
    }
    addEffectControls() {
        this.effectBG = this.scene.add.rectangle(this.x + 200, this.y, 100, 100, 0xc1c1c1, 1).setOrigin(0).setDepth(1).setStrokeStyle(2, 0x000000, 1)
        this.effectBGInner = this.scene.add.rectangle(this.x + 210, this.y + 10, 80, 80, 0xffffff, 1).setOrigin(0).setDepth(1).setStrokeStyle(1, 0x000000, .5)
        this.effectStick = this.scene.add.rectangle(this.effectBG.x + 10, this.effectBG.y + 10, 25, 25, generateColor(), 1).setDepth(2)
            .setOrigin(0)
            .on('pointerover', () => { this.effectStick.setFillStyle(generateColor()); })
            .on('pointerout', () => { this.effectStick.setFillStyle(generateColor()); this.helpText.setText("") })
            .setInteractive({ useHandCursor: true, draggable: true })
            .on('drag', (pointer: any, gameObject: Phaser.GameObjects.Rectangle, dragY: number, dragX: number) => {
                if(this.activePad){
                    let params = this.getEffectParams(this.effects[this.activePad]);
                    // console.log(params);
    
                    let x = pointer.position.x - this.effectBG.x
                    let y = pointer.position.y - this.effectBG.y
                    // console.log(y)
                    if (x < 0) {
                        x = 0
                    }
                    if (x > 100) {
                        x = 100
                    }
                    if (y < 0) {
                        y = 0
                    }
                    if (y > 100) {
                        y = 100
                    }
                    let X = this.convertXToEffectParam1(x);
                    let Y = this.convertYToEffectParam2(y);
    
    
    
                    this.helpText.setText(`${X.toFixed(2)} ${params[0]} ${Y} ${params[1]}`)
                    this.effectObjects[this.activePad].set({
                        [`${params[0]}`]: X,
                        [`${params[1]}`]: Y
                        
                    })
                    this.effectStick.x = pointer.position.x
                    this.effectStick.y = pointer.position.y
                }
                

            })

        this.effectStickInner = this.scene.add.ellipse(this.effectStick.x + 7.5, this.effectStick.y + 7.5, 10, 10, 0x000000, 1).setOrigin(0).setDepth(3)



    }
    effect(effect: any) {
        throw new Error("Method not implemented.");
    }
    connectEffect(dest: string){
        console.log(this.connections[dest].indexOf(this.effects[this.activePad]))

        if(this.connections[dest].indexOf(this.effects[this.activePad]) === -1){
            this.connections[dest].push(this.effects[this.activePad]);
            console.log(`connecting: ${this.effects[this.activePad]}`)
            console.log(`object: ${this.effectObjects[this.activePad]}`)
            console.log(`dest: ${dest}`)
            switch(dest){
                case 'keys':
                this.keys.chain(this.effectObjects[this.activePad]);
                break;
                case 'drums':
                this.drums.forEach((eachDrum)=>{ eachDrum.chain(this.effectObjects[this.activePad])})
                break;
                case 'bass':
                this.bass.chain(this.effectObjects[this.activePad]);
                break;
    
            }
        } else {
            this.disconnectEffect(dest);
        }
        
        
    }
    disconnectEffect(dest: string){

        switch(dest){
            case 'keys':
            this.keys.disconnect(this.effectObjects[this.activePad]);
            break;
            case 'drums':
            this.drums.forEach((eachDrum)=>{ eachDrum.disconnect(this.effectObjects[this.activePad])})
            break;
            case 'bass':
            this.bass.disconnect(this.effectObjects[this.activePad]);
            break;

        }
        this.connections[dest] = this.connections[dest].filter((effect)=>{
            return effect !== this.effects[this.activePad]
        })
    }
    disconnectAll(){
        Object.keys(this.connections).forEach((eachConnect)=>{
            this.connections[eachConnect].forEach(effectKey => {
                if(eachConnect === 'drums'){

                } else {
                    this[eachConnect].disconnect(this.effectObjects[this.activePad]);

                }
            });
        })
        this.keys.disconnect(this.effectObjects[this.activePad]);
        this.drums.forEach((eachDrum)=>{ eachDrum.disconnect(this.effectObjects[this.activePad])})
        this.bass.disconnect(this.effectObjects[this.activePad]);
    }
    createSamplerControls() {
        // background
        this.scene.add.rectangle(this.x, this.y, 200, 100, generateColor(), 1).setDepth(1).setOrigin(0)
            .setStrokeStyle(2, 0x000000, 1)

        // // mute /  unmute
        // this.scene.add.ellipse(this.x + 155, this.y + 70, 20, 20, generateColor(), 1).setOrigin(0).setDepth(1)
        //     .setStrokeStyle(3, 0x000000, 1).setInteractive({ useHandCursor: true })
        //     .on('pointerdown', () => {
        //         this.disconnectAll();
        //     })

        this.keysBtn = this.scene.add.rectangle(this.x + 125, this.y, 75, 33, generateColor(), 1).setDepth(1).setOrigin(0)
            .setStrokeStyle(2, 0x000000, 1).setDepth(1).setOrigin(0).setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                    this.helpText.setText('Add/Remove Selected Effect to Keyboard')
            })
            .on('pointerout', () => {
                this.helpText.setText('')
            })
            .on('pointerdown', () => {
                this.connectEffect('keys')
            })

        this.drumsBtn = this.scene.add.rectangle(this.x + 125, this.y + 33, 75, 33, generateColor(), 1).setDepth(1).setOrigin(0)
            .setStrokeStyle(2, 0x000000, 1).setDepth(1).setOrigin(0).setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                    this.helpText.setText('Add/RemoveSelected Effect to Drums')
            })
            .on('pointerout', () => {
                this.helpText.setText('')
            })
            .on('pointerdown', () => {

                this.connectEffect('drums')
               
            })

        this.bassBtn = this.scene.add.rectangle(this.x + 125, this.y + 66, 75, 33, generateColor(), 1).setDepth(1).setOrigin(0)
            .setStrokeStyle(2, 0x000000, 1).setDepth(1).setOrigin(0).setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                    this.helpText.setText('Add/Remove Selected Effect to Bass')
            })
            .on('pointerout', () => {
                this.helpText.setText('')
            })
            .on('pointerdown', () => {

                this.connectEffect('bass')
               
            })

            
        this.pads = ['pad0', 'pad1', 'pad2', 'pad3', 'pad4', 'pad5'];
        let xPadd = 0;
        let yPadd = 0;
        let breakPoint = 2;

        // 
        this.pads.forEach((pad, i) => {

            this[pad] = this.scene.add.rectangle(this.x + xPadd, this.y + yPadd, 50, 50, generateColor(), 1).
                setStrokeStyle(2, 0x000000, 1).setDepth(1).setOrigin(0).setInteractive({ useHandCursor: true })
                .on('pointerover', () => {
                    if (!this.activePad) {
                        this.helpText.setText(this.effects[i])
                    }

                })
                .on('pointerout', () => {
                    this.helpText.setText('')
                })
                .on('pointerdown', () => {

                    // this current pad is already selected
                    if (this.activePad == i) {
                        console.log('into ' + i)
                        this.activePad = undefined;
                        this[pad].setFillStyle(generateColor(), 1);
                        return;
                    }

                    // no pad selected -lets assign selected
                    if (this.activePad === undefined) {
                        this[pad].setFillStyle(0xc1c1c1, 1);
                        this.activePad = i;
                    }
                })

            // adjust the spaces between pads
            if (i < breakPoint) {
                xPadd = xPadd + 50
            } else {
                if (i == breakPoint) {
                    xPadd = 0
                    yPadd = 50
                } else {
                    xPadd = xPadd + 50
                    yPadd = 50
                }

            }
        });
    }
    muteAllPads() {
        for (var i = 0; i < this.pads.length; i++) {
            this[`pad${i}`].setFillStyle(0x00000, .5)
        }
    }
    unMuteAllPads() {
        for (var i = 0; i < this.pads.length; i++) {
            this[`pad${i}`].setFillStyle(generateColor(), 1)
        }
    }


    update() {
        if (this.effectStick && this.effectBG) {
            if (this.effectStick.x > this.effectBG.x + 65) {
                this.effectStick.x = this.effectBG.x + 65
            }
            if (this.effectStick.x < this.effectBG.x) {
                this.effectStick.x = this.effectBG.x
            }
            if (this.effectStick.y > this.effectBG.y + 65) {
                this.effectStick.y = this.effectBG.y + 65
            }
            if (this.effectStick.y < this.effectBG.y + 10) {
                this.effectStick.y = this.effectBG.y + 10
            }
            this.effectStickInner.x = this.effectStick.x + 7.5
            this.effectStickInner.y = this.effectStick.y + 7.5
        }
    }

}