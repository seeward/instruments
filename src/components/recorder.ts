import 'phaser';
import { Player, Recorder } from 'tone';
import { generateColor } from '../helpers/PhaserHelpers';

export default class CustomRecorder extends Phaser.GameObjects.Container {
    isRecording: boolean = false
    recorder: Recorder = new Recorder();
    startBtn: Phaser.GameObjects.Ellipse
    stopBtn: Phaser.GameObjects.Rectangle
    playBtn: Phaser.GameObjects.Rectangle
    currentLoop: Player
    lastRecording: Blob
    h: number
    w: number
    tooltip: Phaser.GameObjects.Text
    helpText: Phaser.GameObjects.Text

    constructor(scene: Phaser.Scene, x: number, y: number, h?: number, w?: number, helpText?: Phaser.GameObjects.Text) {
        super(scene, x, y);
        this.helpText = helpText ? helpText : null
        this.h = h ? h : 50
        this.w = w ? w : 50
        this.scene.add.existing(this);
        this.addControls();
    }
    getRecorder() {
        return this.recorder
    }
    addControls() {

        this.tooltip = this.scene.add.text(this.x + 10, this.y - 40, '', { color: '#000000', fontSize: '12px' }).setDepth(1).setOrigin(0)
        this.startBtn = this.scene.add.ellipse(this.x - 5, this.y, this.w / 3, this.h / 3, generateColor(), 1).setDepth(1).setOrigin(0)
            .setOrigin(0).setInteractive({ useHandCursor: true })
            .on("pointerover", () => {

                this.tooltip.setText("RECORD")

            }).setStrokeStyle(2, 0x000000,.5)
            .on("pointerout", () => {
                this.tooltip.setText("")
            })
            .on("pointerdown", () => {
                this.startRecording()
            })


        this.stopBtn = this.scene.add.rectangle(this.x + this.w / 3, this.y, this.w / 3, this.h / 3, generateColor(), 1).setDepth(1)
            .setOrigin(0).setStrokeStyle(2, 0x000000,.5)
            .setInteractive({ useHandCursor: true })
            .on("pointerover", () => {

                this.tooltip.setText("STOP RECORDING")

            })
            .on("pointerout", () => {
                this.tooltip.setText("")
            })
            .on("pointerdown", () => {
                if (this.recorder.state == 'started') {
                    this.stopRecording()
                }


            })
        this.playBtn = this.scene.add.rectangle(this.x + (this.w / 3) * 2, this.y, this.w / 3, this.h / 3, generateColor(), 1)
            .setOrigin(0).setDepth(1).setStrokeStyle(2, 0x000000,.5)
            .setInteractive({ useHandCursor: true })
            .on("pointerover", () => {

                this.tooltip.setText("PLAY / STOP")

            })
            .on("pointerout", () => {
                this.tooltip.setText("")
            })
            .on("pointerdown", () => {
                if (this.currentLoop.state == 'stopped') {
                    this.startPlayback()
                } else {
                    this.stopPlayback()
                }

            })

    }
    startRecording() {
        if (!this.isRecording) {
            this.startBtn.setScale(1.25)

            this.isRecording = true
            this.recorder.start();
            console.log(`Recording Started :: ${this.recorder.state}`)
        }

    }
    async stopRecording() {
        if (this.isRecording) {
            this.startBtn.setScale(1)

            let recording = await this.recorder.stop();
            console.log(`Recording Stopped :: ${this.recorder.state}`)
            this.lastRecording = recording
            this.currentLoop = new Player(
                URL.createObjectURL(recording)
            ).toDestination().connect(this.recorder)
            this.currentLoop.set({loop: true})
            this.isRecording = false
        }


    }
    clearRecording() {
        this.currentLoop = undefined;
    }
    disconnectRecording() {
        this.currentLoop.disconnect(this.recorder);
    }
    connectRecording() {
        this.currentLoop.connect(this.recorder);
    }
    startPlayback() {
        this.currentLoop.start();
    }
    stopPlayback() {
        this.currentLoop.stop();
    }
    downloadRecording() {
        const url = URL.createObjectURL(this.lastRecording);
        const anchor = document.createElement("a");
        anchor.download = `${new Date().toISOString()}.webm`;
        anchor.href = url;
        anchor.click();
    }
    update() {
        
    }

} 