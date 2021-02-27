import { Loop, now, Player, Reverb, Sequence, Transport } from "tone";
import { Tone } from "tone/build/esm/core/Tone";
import { generateColor } from "../helpers/PhaserHelpers";


export default class DrumPad extends Phaser.GameObjects.Container {

    seqLength: number = 16;
    sequence: boolean[] = this.initSeqArray();
    muted: boolean = false;
    pad: Phaser.GameObjects.Rectangle;
    seqCircles: Phaser.GameObjects.Ellipse[] = [];
    sound: Player;
    mainSeq: Loop;
    allSelected: boolean = false;
    verb: Reverb;

    constructor(scene: Phaser.Scene, x: number, y: number, sound: string) {
        super(scene, x, y);
        this.scene.add.existing(this);
        this.verb = new Reverb(.5).toDestination()
        this.sound = new Player(sound).toDestination().chain(this.verb);
        this.makePadControl();
        this.makeSequenceControls();
        this.makeSequence();

    }
    initSeqArray() {
        var arr = [];
        for (var i = 0; i < this.seqLength; i++) {
            arr.push(false);
        }
        return arr;
    }
    adjustVerbDecay(decay: number) {
        this.verb.set({ decay: decay })
    }
    makeSequence() {
        let self = this.scene;
        let i = 0
        this.mainSeq = new Loop((time) => {

            if (!this.muted) {
                if (this.sequence[i]) {
                    this.sound.start(time);
                    this.hitSeqCircle(i, self);
                } else {
                    this.hitSeqOffBeats(i, self)

                }
                if (i + 1 === this.seqLength) {
                    i = 0
                } else {
                    i++
                }
            }

        }, '16n').start(now());


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

        let bg = this.scene.add.rectangle(this.x + 5, this.y + 10, 30, 30, 0x000000, .5).setDepth(2).setOrigin(0)
        this.pad = this.scene.add.rectangle(this.x + 10, this.y + 15, 20, 20, generateColor(), 1).setOrigin(0).setDepth(2)
            .setDepth(2).setOrigin(0).setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {

                this.muted = !this.muted
                this.pad.setAlpha(this.muted ? .5 : 1)

            })

    }
    getSequence() {
        return this.sequence;
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

        let onOff = this.scene.add.rectangle(this.x + 370, this.y + 20, 10, 10, generateColor(), 1)
            .setOrigin(0).setDepth(2).setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0xffffff, 1)
            .on('pointerdown', () => {
                onOff.setFillStyle(this.allSelected ? generateColor() : 0x000000, 1)
                this.setAllSeqStepsOnOrOff();
            })

        let vol = this.scene.add.ellipse(this.x + 390, this.y + 20, 10, 10, generateColor(), 1).setDepth(2).setOrigin(0)
            .setInteractive({ useHandCursor: true, draggable: true }).setStrokeStyle(2, 0xffffff, 1)
            .on('drag', (pointer: any, gameObject: Phaser.GameObjects.Rectangle, dragY: number, dragX: number) => {
                console.log(Math.floor(pointer.y - this.y) * -1)
                let y = Math.floor(pointer.y - this.y) * -1
                if (y < -20) {
                    y = -20
                }
                if (y > 5) {
                    y = 5
                }
                volBG.setVisible(true)
                volText.setText(y.toString() + " db")
                this.sound.set({ volume: y })
            })
            .on('pointerout', () => {
                volBG.setVisible(false)
                volText.setText('')
            })
        let volBG = this.scene.add.rectangle(this.x + 355, this.y - 15, 45, 20, generateColor(), 1).setDepth(2).setOrigin(0).setVisible(false)
        let volText = this.scene.add.text(this.x + 360, this.y - 10, "", { fontSize: '10px', color: '#000000' }).setDepth(3).setOrigin(0)

    }
    update() {

    }
}