import 'phaser';
import { Meter, Player, Recorder, UserMedia } from 'tone';
import { generateColor } from '../helpers/PhaserHelpers';


const createId = function () {
    return (
        "_" +
        Math.random()
            .toString(36)
            .substr(2, 9)
    );
}


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
    inputLevel: number = 0
    inputMeterLine: Phaser.GameObjects.Rectangle;
    inputMeterLineBackground: Phaser.GameObjects.Rectangle;
    meter: Meter = new Meter();
    micBtn: Phaser.GameObjects.Ellipse;
    mic: UserMedia;

    constructor(scene: Phaser.Scene, x: number, y: number, h?: number, w?: number, helpText?: Phaser.GameObjects.Text) {
        super(scene, x, y);
        this.helpText = helpText ? helpText : null
        this.h = h ? h : 50
        this.w = w ? w : 50


        this.scene.add.existing(this);
        this.addMic();
        this.addControls();
    }
    addMic() {
        this.mic = new UserMedia().chain(this.meter, this.recorder);
    }
    getRecorder() {
        return this.recorder
    }
    startMic() {

        this.inputMeterLineBackground = this.scene.add.rectangle(this.micBtn.x + 20, this.micBtn.y + 5, 0, 10, 0x000000, 1)
            .setOrigin(0).setDepth(3)
        this.inputMeterLine = this.scene.add.rectangle(this.micBtn.x + 20, this.micBtn.y + 5, 10, 10, 0x000000, 1)
            .setOrigin(0).setDepth(3)
        this.inputMeterLineBackground.width = 10



        this.mic
            .open()
            .then(() => {

                // promise resolves when input is available
                console.log("mic open");
                this.inputMeterLineBackground.setFillStyle(0xff0000)
                this.inputMeterLine.setFillStyle(0x000000)
                this.inputMeterLine.width = 0
                // setInterval(() => {

                //     console.log(this.meter.getValue());

                // }

                //     , 100);
            })
            .catch(e => {
                // promise is rejected when the user doesn't have or allow mic access
                console.log("mic not open");
            });
    }

    addControls() {

        this.tooltip = this.scene.add.text(this.x + 10, this.y - 40, '', { color: '#000000', fontSize: '12px' }).setDepth(1).setOrigin(0)
        this.startBtn = this.scene.add.ellipse(this.x - 5, this.y, this.w / 3, this.h / 3, generateColor(), 1).setDepth(1).setOrigin(0)
            .setOrigin(0).setInteractive({ useHandCursor: true })
            .on("pointerover", () => {

                this.helpText.setText("RECORD")

            }).setStrokeStyle(2, 0x000000, .5)
            .on("pointerout", () => {
                this.helpText.setText("")
            })
            .on("pointerdown", () => {
                // this.startMic(this);
                this.startRecording()

            })


        this.stopBtn = this.scene.add.rectangle(this.x + this.w / 3, this.y, this.w / 3, this.h / 3, generateColor(), 1).setDepth(1)
            .setOrigin(0).setStrokeStyle(2, 0x000000, .5)
            .setInteractive({ useHandCursor: true })
            .on("pointerover", () => {

                this.helpText.setText("STOP RECORDING")

            })
            .on("pointerout", () => {
                this.helpText.setText("")
            })
            .on("pointerdown", () => {
                if (this.recorder.state == 'started') {
                    this.stopRecording()
                }


            })


        this.playBtn = this.scene.add.rectangle(this.x + (this.w / 3) * 2, this.y, this.w / 3, this.h / 3, generateColor(), 1)
            .setOrigin(0).setDepth(1).setStrokeStyle(2, 0x000000, .5)
            .setInteractive({ useHandCursor: true })
            .on("pointerover", () => {

                this.helpText.setText("PLAY / STOP")

            })
            .on("pointerout", () => {
                this.helpText.setText("")
            })
            .on("pointerdown", () => {
                if (this.currentLoop.state == 'stopped') {
                    this.startPlayback()
                } else {
                    this.stopPlayback()
                }

            })

        this.micBtn = this.scene.add.ellipse(this.x + this.width + 80, this.y, this.w / 3, this.h / 3, generateColor(), 1).setDepth(1).setOrigin(0)
            .setOrigin(0).setInteractive({ useHandCursor: true })
            .on("pointerover", () => {

                this.helpText.setText("Turn on/off Mic")

            }).setStrokeStyle(2, 0x000000, .5)
            .on("pointerout", () => {
                this.helpText.setText("")
            })
            .on("pointerdown", () => {
                if (this.mic.state !== 'stopped') {
                    console.log('into closing mic')
                    this.mic.close()
                    this.inputMeterLine.destroy()
                    this.inputMeterLineBackground.destroy()
                } else {
                    this.startMic();
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

            // download the recording by creating an anchor element and blob url
            const url = URL.createObjectURL(recording);
            const anchor = document.createElement("a");
            anchor.download = `${createId()}.webm`;
            anchor.href = url;
            anchor.click();
            console.log(`Recording Stopped :: ${this.recorder.state}`)
            this.lastRecording = recording
            // this.currentLoop = new Player(
            //     URL.createObjectURL(recording)
            // ).toDestination().connect(this.recorder)
            // this.currentLoop.set({loop: true})
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
        if (this.inputMeterLine) {
            this.inputMeterLine.width = this.mic.state === 'started' ? 
            ((this.meter.getValue() as number) > 100 ? 90 : (this.meter.getValue() as number)) * -1 / .75 
            : 0

        }

    }

}