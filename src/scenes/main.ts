import 'phaser';
import { Recorder, Player, AutoFilter, Distortion, Meter, FMSynth, Delay, PolySynth, UserMedia, PingPongDelay, Transport, start } from 'tone';
import KeyBoard from '../components/keyboard';
import { generateColor } from '../helpers/PhaserHelpers';
import Sampler from '../components/sampler';
import CustomRecorder from '../components/recorder';
import DrumMachine from '../components/drumMachine';
import BassPlayer from '../components/bassPlayer';
import TransportControl from '../components/transportControl';
import EffectControls  from "../components/effectControls";


export default class DashboardScene extends Phaser.Scene {

    recorder: CustomRecorder
    synth: any;
    keys: KeyBoard
    sampler: Sampler;
    drumMachine: DrumMachine;
    helpText: Phaser.GameObjects.Text;
    logText: Phaser.GameObjects.Text;
    transport_: TransportControl;
    bassPlayer_: BassPlayer;
    effects: EffectControls;

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
                   
                    anchor.href = url;
                    anchor.click();
                }, 10000);
                // print the incoming mic levels in decibels
                setInterval(() => console.log(meter.getValue()), 100);
            })
            .catch(e => {
                // promise is rejected when the user doesn't have or allow mic access
                console.log("mic not open");
            });
    }


    async create() {
        this.physics.world.setBounds(5, 5, 1275, 595);
        this.add.rectangle(0,0, 1280,720,generateColor(), 1).setOrigin(0)
        
        //let bg = this.add.image(0,0,'bg').setOrigin(0).setScale(1).setAlpha(1)
        let bg1 = this.add.rectangle(0,0,1280,720, 0xffffff,0).setStrokeStyle(10,0x000000,1).setOrigin(0)
        let footer = this.add.rectangle(0,600, 1280, 150, 0x000000,1).setOrigin(0).setDepth(1)
        let footer2 = this.add.rectangle(5,605, 1270, 110, generateColor(),1).setOrigin(0).setDepth(1)
        this.add.text(25,630, "l00pSt@ti0n", { fontSize: '75px', color: '#000000'}).setDepth(3)
        this.add.text(475,700, "v 1.0.1", { fontSize: '10px', color: '#000000'}).setDepth(3)
        this.logText = this.add.text(575,700, "#> ML Checkpoints loading...", { fontSize: '10px', color: '#000000'}).setDepth(3)
        this.helpText = this.add.text(550, 645, "", { fontSize: '28px', color: '#000000'}).setDepth(2)
        this.drumMachine = new DrumMachine(this, 25,25, this.helpText, this.logText);
        const delay = new Delay(.01).toDestination();
        this.synth = new FMSynth({volume: -20}).toDestination()
        
        // let u = this.add.rectangle(12,4120,1255,695, 0xffffff,.75).setOrigin(0).setStrokeStyle(3,0x000000,1).setDepth(1)
        // let y = this.add.rectangle(450,140,800,275, 0xffffff,1).setOrigin(0).setStrokeStyle(3,0x000000,1).setDepth(1)
            
        // this.recorder = new CustomRecorder(this, 1080, 525,50,50, this.helpText).setDepth(2)
        // let _sampler = new Sampler(this,1150, 300,this.helpText, this.recorder)
        
        this.keys = new KeyBoard(this, 600, 75, null, delay, this.synth, this.helpText, this.logText).setDepth(1)
        let handler = () => {
            // play note so far it can't be heard
            start()
            // remove this handler to save memory 
            document.removeEventListener('click', handler, false)
        }
        // this is to enable web audio when page is clicked
        document.addEventListener('click', handler)

        this.bassPlayer_ = new BassPlayer(this, 25, 440, this.helpText);

        this.transport_ = new TransportControl(this, 1050, 525,this.helpText)
        this.effects = new EffectControls(this, 750, 525, this.drumMachine.getPlayers(), this.bassPlayer_.getSynth(), this.keys.getSynth(), this.helpText)
    }

    update() {
        this.effects.update();
        this.keys.update()
        this.transport_.update();
        this.drumMachine.update()
    }
}
