import { Loop, MonoSynth, Player } from 'tone';
import { generateColor } from '../helpers/PhaserHelpers';
import DrumPad from './drumPad';


export default class BassPad extends DrumPad {
    note: string;
    synth: MonoSynth;
    noteText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number,  sound: string, synth?: MonoSynth, helpText?: Phaser.GameObjects.Text, player?: Player){
        super(scene,x,y, sound, player, helpText);
        this.synth = synth;
        this.helpText = helpText ? helpText : null;
        this.sound = new Player().toDestination();
        this.note = sound
        this.makePattern(0, this.scene)
        this.makeSequenceControls();
        this.scene.add.existing(this);
    }
    setUpSounds(){
        console.log('into set up sounds')
    }
    makeSeqCircle(inx: number, xSpace: number, scene: Phaser.Scene) {

        let u = this.scene.add.ellipse(this.x + xSpace, this.y + 15, 10, 10, 0x000000, 1)
            .setDepth(3).setOrigin(0)
            .setStrokeStyle(1, 0xffffff)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.setSeqOnOff(inx);
                u.setFillStyle(this.sequence[inx] ? 0xffffff : 0x000000);
            })
            .on('pointerover', () => {
                let pointer = scene.input.activePointer;
                if (pointer.isDown) {
                    this.setSeqOnOff(inx);
                    u.setFillStyle(this.sequence[inx] ? 0xffffff : 0x000000);
                }
            })
        this.seqCircles.push(u)

        return u
    }
    setNote(n:string){
        this.note = n
        this.noteText.setText(n)
    }
    makeSequenceControls() {
        let xSpace = 25;

        this.noteText = this.scene.add.text(this.x + 5, this.y + 14, this.note, {fontSize: '10px', color: '#000000'})
        .setOrigin(0).setDepth(3)
        for (var i = 0; i < this.seqLength; i++) { 
            let t = this.makeSeqCircle(i, xSpace, this.scene)
            xSpace = xSpace + 15;
        }
""
        this.onOff = this.scene.add.rectangle(this.x + 267, this.y + 15, 10, 10, generateColor(), 1)
            .setOrigin(0).setDepth(3).setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0x000000, 1)
            .on('pointerdown', () => {
                this.onOff.setFillStyle(this.allSelected ? 0xffffff : 0x000000, 1)
                this.setAllSeqStepsOnOrOff();
            })
            .on('pointerover', () => {
                this.helpText.setText('Add / Remove All Steps')
            })
            .on('pointerout', () => {
                this.helpText.setText('')
            })

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
    makePattern(index?: number, self?: Phaser.Scene){
        console.log("INTO MAKE PATTERN - BASS")
        this.i = index;
        this.patternLoop = new Loop((time)=>{

            if (!this.muted) {
                if (this.sequence[this.i]) {
                    this.synth.triggerAttackRelease(this.note, '16n', time)
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
    update(){

    }
}
