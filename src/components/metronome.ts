import 'phaser';
import { Oscillator, Transport } from 'tone';
import { generateColor } from '../helpers/PhaserHelpers'

export default class Metronome extends Phaser.GameObjects.Container {

    running: boolean = false
    delay: number = 1000
    metronomeControls: Phaser.GameObjects.Rectangle
    bpm: number = 110
    slider: Phaser.GameObjects.Ellipse
    bpmText: Phaser.GameObjects.Text    
    width: number = 100
    height: number = 100
    tooltip: Phaser.GameObjects.Text;
    helpText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number, bpm?: number, width?:number, height?: number, helpText?: Phaser.GameObjects.Text) {
        super(scene, x, y);
        this.helpText = helpText ? helpText : null
        if (bpm) {
            this.bpm = bpm
            Transport.bpm.value = this.bpm;
        }
        if(width && height){
            this.width = width
            this.height = height
        }
        this.createControls(this);
        this.addBPMControl()
        this.scene.add.existing(this)
    }
    addBPMControl() {
        this.tooltip = this.scene.add.text(this.x - 90, this.y + 135, '', { color: '#000000', fontSize: '12px' }).setOrigin(0).setDepth(1)
        this.slider = this.scene.add.ellipse(this.x + this.width - 10, this.y + this.height, 25, 25, 0x000000, 1).setDepth(1)
            .setInteractive({ useHandCursor: true, draggable: true }).setOrigin(0).setDepth(3)
            .on('drag', (pointer: any, gameObject: Phaser.GameObjects.Rectangle, dragY: number, dragX: number) => {
                // console.log(dragY);
                this.slider.y = pointer.position.y < this.y + this.height ? pointer.position.y : this.y + this.height
                this.bpm = this.convertPointerToBpm(pointer.position.y)
                this.helpText.setText(this.bpm.toString() +' Beats per minute')
                Transport.bpm.value = this.bpm;

            })
            .on('pointerover', ()=>{
                this.helpText.setText('Drag to adjust beats per minute')
            })
            .on('pointerout', ()=>{
                this.helpText.setText('')
            })

        this.bpmText = this.scene.add.text(this.slider.x + 4, this.slider.y + 7, this.bpm.toString(), { color: '#ffffff', fontSize: '10px' }).setOrigin(0).setDepth(3)

    }
    convertPointerToBpm(pointerY){
        let resolvedY = pointerY - this.y;
        console.log(resolvedY)
        if(resolvedY < 10){
           return 10
        }
        if(resolvedY > 160){
            return 160
        }
        return Math.floor(resolvedY)

    }
    start() {
        this.running = true
        Transport.start()
    }
    stop() {
        this.running = false
        Transport.stop()
    }
    createControls(t) {
        const osc = new Oscillator({ volume: -20 }).toDestination();
        Transport.bpm.value = this.bpm;
        // repeated event every 1/4 note
        Transport.scheduleRepeat((time) => {
            // e.log(Transport)
            // use the callback time to schedule events
            // osc.start(time).stop(time + 0.025);
            this.metronomeControls.setFillStyle(generateColor());

        }, "4n");

        this.metronomeControls = this.scene.add
            .rectangle(this.x, this.y, this.width, this.height, generateColor())
            .setOrigin(0).setDepth(1)
            .setAlpha(1).setStrokeStyle(1, 0x000000, 1)
            // .setInteractive({ useHandCursor: true })
            // .on("pointerdown", () => {
            //     this.running = !this.running
            // }, this);
    }
    update() {
        this.bpmText.setText(this.bpm.toString())

        if (this.slider.y > this.y + this.height - 25) {
            this.slider.y = this.y + this.height -25
        }
        if (this.slider.y < this.y) {
            this.slider.y = this.y
        }
        this.bpmText.x = this.slider.x + 4
        this.bpmText.y = this.slider.y + 7
    }
}