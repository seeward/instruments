import { Scene } from "phaser";
import { Loop, now, Player, Reverb, Sequence, Transport } from "tone";
import { Tone } from "tone/build/esm/core/Tone";
import { generateColor } from "../helpers/PhaserHelpers";


export default class DrumPad extends Phaser.GameObjects.Container {

    seqLength: number = 16;
    sequence: boolean[] = this.initSeqArray();
    muted: boolean = false;
    pad: Phaser.GameObjects.Rectangle;
    seqCircles: Phaser.GameObjects.Ellipse[] = [];
    public sound: Player;
    mainSeq: Loop;
    allSelected: boolean = false;
    verb: Reverb;
    helpText: Phaser.GameObjects.Text
    makeBubbles: boolean = true;
    bg: Phaser.GameObjects.Rectangle;
    onOff: Phaser.GameObjects.Rectangle;
    vol: Phaser.GameObjects.Ellipse;
    volBG: Phaser.GameObjects.Rectangle;
    volText: Phaser.GameObjects.Text;
    loopIndex: number = 0;
    patternLoop: Loop<any>;
    i: number;

    constructor(scene: Phaser.Scene, x: number, y: number, sound: string, player?: Player, helpText?: Phaser.GameObjects.Text) {
        super(scene, x, y);
        this.helpText = helpText ? helpText : null
        this.setUpSounds(sound, player);
        
        Transport.on('start', () => {
            this.patternLoop.start(0)
        })
        Transport.on('stop', ()=>{
           
            this.i = 0
            this.patternLoop.set({position: '00:00:00'})
        })
        this.scene.add.existing(this);

    }
    setUpSounds(sound: string, player: Player){
        this.verb = new Reverb(.5).toDestination()

        this.sound = new Player().toDestination().chain(this.verb)
        this.loadSound(sound).then((result) => {
            if (this.sound.loaded) {
                this.makePadControl();
                this.makeSequenceControls();
                this.makePattern(0, this.scene)
                // this.makeSequence(0, this.scene);
            }
        })
    }
    getPlayer(){
        return this.sound
    }
    async loadSound(sound: string) {
        return await this.sound.load(sound)
    }
    onDestroy() {


        this.pad.destroy()
        this.seqCircles.forEach((eachOne) => {
            eachOne.destroy()
        })
        this.sound.dispose()
        this.mainSeq.dispose()
        this.verb.dispose()

        this.bg.destroy()
        this.onOff.destroy()
        this.vol.destroy()
        this.volBG.destroy()
        this.volText.destroy()
    }
    initSeqArray() {
        var arr = [];
        for (var i = 0; i < this.seqLength; i++) {
            arr.push(false);
        }
        return arr;
    }
    makeBubble(x: number, y: number, s: Scene) {

        if (this.makeBubbles) {
            let rand = Math.floor(Phaser.Math.Between(1, 3))
            let text = rand == 1 ? 'bubble' : rand == 2 ? 'bubble2' : 'bubble3'
            let t = s.physics.add.sprite(x + 10, y - 10, text).setDepth(1)
                .setVelocityY(Phaser.Math.Between(10, 150))
                .setCollideWorldBounds(true)
                .setVelocityX(Phaser.Math.Between(100, 150))
                .setBounce(.5).setDepth(0).setTintFill(generateColor())
            setTimeout(() => { t.destroy() }, 7000)
        }
    }
    adjustVerbDecay(decay: number) {
        this.verb.set({ decay: decay })
    }
    makePattern(index?: number, self?: Phaser.Scene){
        console.log("INTO MAKE PATTERN")
        this.i = index;
        this.patternLoop = new Loop((time)=>{

            if (!this.muted) {
                if (this.sequence[this.i]) {
                    this.sound.start(time);
                    this.hitSeqCircle(this.i, self);
                    this.makeBubble(this.x + 100, this.y + 300, self)
                } else {
                    this.hitSeqOffBeats(this.i, self)
                }
                if (this.i + 1 === this.seqLength) {
                    this.i = 0
                } else {
                    this.i++
                }
            }

        },'16n').start(0)
        
        
    }
    makeSequence(index: number, self: Phaser.Scene) {
        console.log("INTO MAKE SEQUENCE")
        let i = index

        this.mainSeq = new Loop((time) => {

            if (!this.muted) {
                if (this.sequence[i]) {
                    this.sound.start(time);
                    this.hitSeqCircle(i, self);
                    this.makeBubble(this.x + 100, this.y + 300, self)
                } else {
                    this.hitSeqOffBeats(i, self)
                }
                if (i + 1 === this.seqLength) {
                    i = 0
                } else {
                    i++
                }
            }

        }, '16n')
    }
    setAllSeqStepsOnOrOff() {
        if (this.allSelected) {
            this.sequence = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
            this.seqCircles.forEach((eachCircle) => {
                eachCircle.setFillStyle(0x000000, 1)
            })
            this.allSelected = false
        } else {
            this.sequence = [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true]
            this.seqCircles.forEach((eachCircle) => {
                eachCircle.setFillStyle(generateColor(), 1)
            })
            this.allSelected = true
        }
    }
    setReverb(lvl: number) {
        this.verb.set({
            decay: lvl
        })
    }
    makePadControl() {

        this.bg = this.scene.add.rectangle(this.x + 5, this.y + 10, 30, 30, 0x000000, .5).setDepth(2).setOrigin(0)
        this.pad = this.scene.add.rectangle(this.x + 10, this.y + 15, 20, 20, generateColor(), 1).setOrigin(0).setDepth(2)
            .setDepth(2).setOrigin(0).setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {

                this.muted = !this.muted
                this.pad.setAlpha(this.muted ? .5 : 1)

            })
            .on('pointerover', () => {
                this.helpText.setText('Mute / Unmute Sample')
            })
            .on('pointerout', () => {
                this.helpText.setText('')
            })

    }
    clear() {
        this.seqCircles.forEach((eachCircle) => {
            eachCircle.setFillStyle(0x000000, 1)
        })
        this.sequence = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];
    }
    getSequence() {
        return this.sequence;
    }
    setSequence(seq: boolean[]) {
        this.sequence = seq;
        this.seqCircles.forEach((eachCircle, i) => {
            if (this.sequence[i]) {
                eachCircle.setFillStyle(generateColor(), 1)
            } else {
                eachCircle.setFillStyle(0x000000, 1)
            }
        })
    }
    isMuted() {
        return this.muted
    }
    setSeqOnOff(i: number, value?: boolean) {
        this.sequence[i] = value ? value : !this.sequence[i];
    }
    makeSeqCircle(inx: number, xSpace: number, scene: Phaser.Scene) {

        let u = this.scene.add.ellipse(this.x + xSpace, this.y + 17, 15, 15, 0x000000, 1).setDepth(2).setOrigin(0)
            .setStrokeStyle(2, 0xffffff)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {

                this.setSeqOnOff(inx);
                u.setFillStyle(this.sequence[inx] ? generateColor() : 0x000000);
            })
            .on('pointerover', () => {
                let pointer = scene.input.activePointer;
                if (pointer.isDown) {
                    this.setSeqOnOff(inx);
                    u.setFillStyle(this.sequence[inx] ? generateColor() : 0x000000);
                }
            })
        this.seqCircles.push(u)

        return u
    }
    hitSeqCircle(i: number, t: Phaser.Scene) {

        t.tweens.add({
            targets: this.seqCircles[i],
            scaleX: 1.15,
            scaleY: 1.15,
            loop: false,
            duration: 100,
            yoyo: true,
            ease: 'Linear',
            onComplete: () => {
                this.destroy()
            }
        })

    }
    hitSeqOffBeats(i: number, t: Phaser.Scene) {
        t.tweens.add({
            targets: this.seqCircles[i],
            scaleX: .90,
            scaleY: .90,
            loop: false,
            duration: 100,
            yoyo: true,
            ease: 'Linear',
            onComplete: () => {

                this.destroy()
            }
        })
    }
    makeSequenceControls() {
        let xSpace = 45;

        for (var i = 0; i < this.seqLength; i++) {
            let t = this.makeSeqCircle(i, xSpace, this.scene)
            xSpace = xSpace + 20;
        }

        this.onOff = this.scene.add.rectangle(this.x + 370, this.y + 20, 10, 10, generateColor(), 1)
            .setOrigin(0).setDepth(2).setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0xffffff, 1)
            .on('pointerdown', () => {
                this.onOff.setFillStyle(this.allSelected ? generateColor() : 0x000000, 1)
                this.setAllSeqStepsOnOrOff();
            })
            .on('pointerover', () => {
                this.helpText.setText('Add / Remove All Steps')
            })
            .on('pointerout', () => {
                this.helpText.setText('')
            })

        this.vol = this.scene.add.ellipse(this.x + 390, this.y + 20, 10, 10, generateColor(), 1).setDepth(4).setOrigin(0)
            .setInteractive({ useHandCursor: true, draggable: true }).setStrokeStyle(2, 0xffffff, 1)
            .on('drag', (pointer: any, gameObject: Phaser.GameObjects.Rectangle, dragY: number, dragX: number) => {
                // console.log(Math.floor(pointer.y - this.y) * -1)
                let y = Math.floor(pointer.y - this.y) * -1
                if (y < -20) {
                    y = -20
                }
                if (y > 5) {
                    y = 5
                }
                this.volBG.setVisible(true)
                this.volText.setText(y.toString() + " db")
                this.sound.set({ volume: y })
            })
            .on('pointerover', () => {
                this.helpText.setText('Drag to Adjust volume of sample')
            })
            .on('pointerout', () => {
                this.volBG.setVisible(false)
                this.volText.setText('')
                this.helpText.setText('')
            })
        this.volBG = this.scene.add.rectangle(this.x + 355, this.y - 15, 45, 20, generateColor(), 1).setDepth(2).setOrigin(0).setVisible(false)
        this.volText = this.scene.add.text(this.x + 360, this.y - 10, "", { fontSize: '10px', color: '#000000' }).setDepth(4).setOrigin(0)

    }
    update() {

    }
}