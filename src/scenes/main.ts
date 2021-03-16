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
import PatternManager from '../components/patternManager';

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
    worker: Worker;
    footer: Phaser.GameObjects.Rectangle;
    footer2: Phaser.GameObjects.Rectangle;
    bg1: Phaser.GameObjects.Rectangle;
    patterns: PatternManager;

    constructor() {
        super({ key: "DashboardScene" });   
        
    }

    async create() {
        
        this.physics.world.setBounds(5, 5, 1275, 595);
        this.add.rectangle(0,0, 1280,720,generateColor(), 1).setOrigin(0)
        this.bg1 = this.add.rectangle(0,0,1280,720, 0xffffff,0).setStrokeStyle(10,0x000000,1).setOrigin(0)
        this.footer = this.add.rectangle(0,600, 1280, 150, 0x000000,1).setOrigin(0).setDepth(1)
        this.footer2 = this.add.rectangle(5,605, 1270, 110, generateColor(),1).setOrigin(0).setDepth(1)
        this.add.text(25,630, "l00pSt@ti0n", { fontSize: '75px', color: '#000000'}).setDepth(3)
        this.add.text(475,700, "v 1.5.1", { fontSize: '10px', color: '#000000'}).setDepth(3)
        this.logText = this.add.text(575,700, "ML Checkpoints loading...", { fontSize: '10px', color: '#000000'}).setDepth(3)
        this.helpText = this.add.text(550, 645, "Click to Explore", { fontSize: '28px', color: '#000000'}).setDepth(2)
        
        
        const delay = new Delay(.01).toDestination();
        this.drumMachine = new DrumMachine(this, 25,25, this.helpText, this.logText);
        this.synth = new FMSynth({volume: -20}).toDestination()
        this.keys = new KeyBoard(this, 600, 150, null, delay, this.synth, this.helpText, this.logText).setDepth(1)
        this.bassPlayer_ = new BassPlayer(this, 25, 440, this.helpText);
        this.transport_ = new TransportControl(this, 1050, 525,this.helpText)
        this.effects = new EffectControls(this, 750, 525, this.drumMachine.getPlayers(), this.bassPlayer_.getSynth(), this.keys, this.helpText)
        this.patterns = new PatternManager(this,500, 25, this.drumMachine, this.helpText)
    }

    update() {
        this.effects.update();
        this.keys.update();
        this.bassPlayer_.update();
        this.transport_.update();
        this.drumMachine.update()
    }
}
