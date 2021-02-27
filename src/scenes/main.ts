import 'phaser';
import { Recorder, Player, AutoFilter, Distortion, Meter, FMSynth, Delay, PolySynth, UserMedia, PingPongDelay } from 'tone';
import KeyBoard from '../components/keyboard';
import { generateColor } from '../helpers/PhaserHelpers';
import Drums from '../components/drums';
import CustomRecorder from '../components/recorder';
import CustomSampler from '../components/sampler';
import DrumMachine from '../components/drumMachine';

export default class DashboardScene extends Phaser.Scene {

    recorder: CustomRecorder
    synth: any;
    keys: KeyBoard
    sampler: CustomSampler;
    drumMachine: DrumMachine;
    helpText: Phaser.GameObjects.Text;

    constructor() {
        super({ key: "DashboardScene" });   
    }

    startMic(t) {
        const meter = new Meter();
        t.mic = new UserMedia().chain(meter);
        t.mic
            .open()
            .then(() => {
                // promise resolves when input is available
                console.log("mic open");
                t.recorder.start();
                setTimeout(async () => {
                    // the recorded audio is returned as a blob
                    const recording = await t.recorder.stop();
                    // download the recording by creating an anchor element and blob url
                    const url = URL.createObjectURL(recording);
                    const anchor = document.createElement("a");
                    anchor.download = "recording.webm";
                    anchor.href = url;
                    anchor.click();
                }, 10000);
                // print the incoming mic levels in decibels
                // setInterval(() => console.log(meter.getValue()), 100);
            })
            .catch(e => {
                // promise is rejected when the user doesn't have or allow mic access
                console.log("mic not open");
            });
    }
    loadSounds(t) {
        t.recorder = new Recorder();
        const dist = new Distortion(1).toDestination();
    }

    create() {
        this.physics.world.setBounds(5, 5, 1275, 595);
        this.add.rectangle(0,0, 1280,720,generateColor(), 1).setOrigin(0)

        //let bg = this.add.image(0,0,'bg').setOrigin(0).setScale(1).setAlpha(1)
        let bg1 = this.add.rectangle(0,0,1280,720, 0xffffff,0).setStrokeStyle(10,0x000000,1).setOrigin(0)
        let footer = this.add.rectangle(0,600, 1280, 150, 0x000000,1).setOrigin(0).setDepth(1)
        let footer2 = this.add.rectangle(5,605, 1270, 110, generateColor(),1).setOrigin(0).setDepth(1)
        this.add.text(25,630, "l00pSt@ti0n", { fontSize: '75px', color: '#000000'}).setDepth(3)

        this.helpText = this.add.text(550, 645, "", { fontSize: '28px', color: '#000000'}).setDepth(2)

        const delay = new Delay('16n').toDestination();
        this.synth = new FMSynth({volume: -20}).toDestination()
        // let u = this.add.rectangle(12,4120,1255,695, 0xffffff,.75).setOrigin(0).setStrokeStyle(3,0x000000,1).setDepth(1)
        // let y = this.add.rectangle(450,140,800,275, 0xffffff,1).setOrigin(0).setStrokeStyle(3,0x000000,1).setDepth(1)
        
        
        this.recorder = new CustomRecorder(this, 525, 150,50,50, this.helpText).setDepth(2)

        this.drumMachine = new DrumMachine(this, 10,25, this.helpText);
        this.keys = new KeyBoard(this, 500, 175, this.recorder, delay, this.synth, this.helpText).setDepth(1)
        let handler = () => {
            // play note so far it can't be heard
            this.synth.triggerAttackRelease('C1', .001)
            // remove this handler to save memory 
            document.removeEventListener('click', handler, false)
        }
        // this is to enable web audio when page is clicked
        document.addEventListener('click', handler)
    }

    update() {
        
        this.keys.update()
        this.drumMachine.update()
    }
}
