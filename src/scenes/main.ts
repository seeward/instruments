import 'phaser';
import { Recorder, Player, AutoFilter, Distortion, Meter, FMSynth, Delay, PolySynth, UserMedia, PingPongDelay } from 'tone';
import KeyBoard from '../components/keyboard';
import { generateColor } from '../helpers/PhaserHelpers';
import Drums from '../components/drums';
import CustomRecorder from '../components/recorder';
import CustomSampler from '../components/sampler';
import DrumMachine from '../components/drumMachine';

let flag = true;
export default class DashboardScene extends Phaser.Scene {

    recorder: CustomRecorder
    percgroove: Player
    electronicgroove: Player
    currentLoop: Player
    hiphopgroove: Player
    flute: any;
    synth: any;
    keys: KeyBoard
    drums: Drums
    sampler: CustomSampler;
    drumMachine: DrumMachine;

    constructor() {
        super({ key: "DashboardScene" });
        
    }
    preload(){

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


        this.hiphopgroove = new Player({
            loop: true,
            volume: 0,
            url:
                "https://cdn.glitch.com/7c3193f6-becc-4a24-9436-33921e31dde6%2Fhiphopgroove.mp3"
        })
            .toDestination()
            .chain(dist, t.recorder);
        
        this.electronicgroove = new Player({
            url:
                "https://cdn.glitch.com/7c3193f6-becc-4a24-9436-33921e31dde6%2Felectronicgroove.mp3",
            loop: true,
            volume: 0
        })
            .toDestination()
            .connect(t.recorder)

        this.percgroove = new Player({
            url:
                "https://cdn.glitch.com/7c3193f6-becc-4a24-9436-33921e31dde6%2Fpercgroove.mp3",
            loop: true,
            volume: 0
        })
            .toDestination()
            .connect(t.recorder);


    }

    create() {
        this.physics.world.setBounds(5, 5, 1275, 595);
        this.add.rectangle(0,0, 1280,720,generateColor(), 1).setOrigin(0)

        //let bg = this.add.image(0,0,'bg').setOrigin(0).setScale(1).setAlpha(1)
        let bg1 = this.add.rectangle(0,0,1280,720, 0xffffff,0).setStrokeStyle(10,0x000000,1).setOrigin(0)
        let footer = this.add.rectangle(0,600, 1280, 150, 0x000000,1).setOrigin(0).setDepth(1)
        let footer2 = this.add.rectangle(5,605, 1270, 110, generateColor(),1).setOrigin(0).setDepth(1)
        this.add.text(25,630, "k3yb00rD", { fontSize: '75px', color: '#000000'}).setDepth(2)
        const delay = new Delay('16n').toDestination();
        this.synth = new FMSynth({volume: -20}).toDestination()
        let u = this.add.rectangle(12,4120,1255,695, 0xffffff,.75).setOrigin(0).setStrokeStyle(3,0x000000,1).setDepth(1)
        let y = this.add.rectangle(450,140,800,275, 0xffffff,1).setOrigin(0).setStrokeStyle(3,0x000000,1).setDepth(1)
        // this.sampler = new CustomSampler(this, 700,45);
        this.recorder = new CustomRecorder(this, 525, 150,50,50).setDepth(2)
        // this.drums = new Drums(this, 170,155, this.recorder);

        this.drumMachine = new DrumMachine(this, 10,25);
        this.keys = new KeyBoard(this, 500, 175, this.recorder, delay, this.synth).setDepth(1)
        let handler = ()=>{
            
            this.synth.triggerAttackRelease('C1', .001)
            document.removeEventListener('click', handler, false)
        }
        document.addEventListener('click',handler )
    }

    update() {
        
        this.keys.update()
        // this.sampler.update()
        this.drumMachine.update()
    }
}
