import 'phaser';
import { Recorder, Player, AutoFilter, Distortion, Meter, FMSynth, Delay, PolySynth, UserMedia, PingPongDelay, Transport, start } from 'tone';
import KeyBoard from '../components/keyboard';
import { generateColor } from '../helpers/PhaserHelpers';
import Sampler from '../components/sampler';
import CustomRecorder from '../components/recorder';
import DrumMachine from '../components/drumMachine';
import BassPlayer from '../components/bassPlayer';
import TransportControl from '../components/transportControl';
import EffectControls from "../components/effectControls";
import PatternManager from '../components/patternManager';
import BassPatternManager from '../components/bassPatternManager';
import HelpLayer from '../components/helpLayer';
import Looper from '../components/looper';

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
    bassPatterns: BassPatternManager;
    helpLayer: HelpLayer;
    introBG: Phaser.GameObjects.Rectangle;
    introText: Phaser.GameObjects.Text;
    bubbles: any[] = []
    toneLogo: Phaser.GameObjects.Image;
    magentaLogo: Phaser.GameObjects.Image;
    phaserLogo: Phaser.GameObjects.Image;
    cpLogo: Phaser.GameObjects.Image;
    typescriptLogo: Phaser.GameObjects.Image;
    webmidiLogo: Phaser.GameObjects.Image;
    looper: Looper;

    constructor() {
        super({ key: "DashboardScene" });

    }

    async create() {

        this.physics.world.setBounds(5, 5, 1275, 595);
        this.add.rectangle(0, 0, 1280, 720, generateColor(), 1).setOrigin(0)
        for (var i = 0; i < 25; i++) {
            this.makeBubble(1280 / 2, 720 / 2);
        }

        this.bg1 = this.add.rectangle(0, 0, 1280, 720, 0xffffff, 0).setStrokeStyle(10, 0x000000, 1).setOrigin(0)
        this.footer = this.add.rectangle(0, 600, 1280, 150, 0x000000, 1).setOrigin(0).setDepth(1)
        this.footer2 = this.add.rectangle(5, 605, 1270, 110, generateColor(), 1).setOrigin(0).setDepth(1)
        this.add.text(25, 630, "l00pSt@ti0n", { fontSize: '75px', color: '#000000' }).setDepth(3)
        this.add.text(475, 700, "v 1.8.3", { fontSize: '10px', color: '#000000' }).setDepth(3)
        this.logText = this.add.text(575, 700, "ML Checkpoints loading...", { fontSize: '10px', color: '#000000' }).setDepth(3)
        this.helpText = this.add.text(550, 645, "Click to Explore", { fontSize: '28px', color: '#000000' }).setDepth(2)
        this.introBG = this.add.rectangle(5, 5, 1270, 600, 0xffffff, .5).setOrigin(0).setDepth(4)
        this.introText = this.add.text(80, 50,
            "l00pSt@ti0n is an educational music creation simulation designed \nto allow musicians and non-musicians the opportunity to experience \nmusic creation on an intuitive rather than technical level.\n\nIt aims to give a simulated experience of modern music production \ntechniques as well as exposure to foundational sound engineering \nprinciples. The simulation is meant to be played with, in order \nto experience the concepts firsthand.\n\nMain concepts:\n\t- Sound Synthesis \n\t- Digital Effects Signal Processing\n\t- Drum and Bass Step Sequencing\n\t- Machine Learning in a musical context\n\nProudly made with:", {
            fontSize: '28px', color: '#000000'
        }).setOrigin(0).setDepth(5);
        this.cpLogo = this.add.image(880,300, 'codeplant').setOrigin(0).setDepth(4).setScale(.20)
        

        this.typescriptLogo = this.add.image(425, 515, 'typescript')
            .setOrigin(0).setDepth(4).setScale(.04).setInteractive({ useHandCursor: true })
            .on("pointerdown", () => {
                var url = 'https://www.typescriptlang.org/'
                var s = window.open(url, '_blank');

                if (s && s.focus) {
                    s.focus();
                }
                else if (!s) {
                    window.location.href = url;
                }
            })
            .on('pointerover', () => {
                this.helpText.setText("@typescript JavaScript that scales!")
            })
            .on('pointerout', () => {
                this.helpText.setText("")
            })

        
        this.toneLogo = this.add.image(500, 515, 'tone')
            .setOrigin(0).setDepth(4).setScale(.16).setInteractive({ useHandCursor: true })
            .on("pointerdown", () => {
                var url = 'https://tonejs.github.io/'
                var s = window.open(url, '_blank');

                if (s && s.focus) {
                    s.focus();
                }
                else if (!s) {
                    window.location.href = url;
                }
            })
            .on('pointerover', () => {
                this.helpText.setText("@tonejs Audio Synthesis in the browser!")
            })
            .on('pointerout', () => {
                this.helpText.setText("")
            })

        this.magentaLogo = this.add.image(575, 515, 'magenta').setOrigin(0).setDepth(4).setScale(.19).setInteractive({ useHandCursor: true })
            .on("pointerdown", () => {
                var url = 'https://magenta.tensorflow.org/js-announce'
                var s = window.open(url, '_blank');

                if (s && s.focus) {
                    s.focus();
                }
                else if (!s) {
                    window.location.href = url;
                }
            })
            .on('pointerover', () => {
                this.helpText.setText("@magenta Musical Machine Learning!")
            })
            .on('pointerout', () => {
                this.helpText.setText("")
            })

        this.phaserLogo = this.add.image(655, 515, 'phaser')
            .setOrigin(0).setDepth(4).setScale(.25).setInteractive({ useHandCursor: true })
            .on("pointerdown", () => {
                var url = 'https://phaser.io'
                var s = window.open(url, '_blank');

                if (s && s.focus) {
                    s.focus();
                }
                else if (!s) {
                    window.location.href = url;
                }
            })
            .on('pointerover', () => {
                this.helpText.setText("@phaser Super fast HTML5 game engine!")
            })
            .on('pointerout', () => {
                this.helpText.setText("")
            })

        

        this.webmidiLogo = this.add.image(725, 515, 'webmidi')
            .setOrigin(0).setDepth(4).setScale(.25).setInteractive({ useHandCursor: true })
            .on("pointerdown", () => {
                var url = 'https://www.midi.org/midi-articles/about-web-midi'
                var s = window.open(url, '_blank');

                if (s && s.focus) {
                    s.focus();
                }
                else if (!s) {
                    window.location.href = url;
                }
            })
            .on('pointerover', () => {
                this.helpText.setText("@webmidi Midi in the browser!")
            })
            .on('pointerout', () => {
                this.helpText.setText("")
            })

        let handler = () => {

            
            this.introBG.destroy();
            this.introText.destroy();
            this.toneLogo.destroy();
            this.phaserLogo.destroy();
            this.magentaLogo.destroy();
            this.cpLogo.destroy();
            this.webmidiLogo.destroy();
            this.typescriptLogo.destroy();

            this.bubbles.forEach((eachOne) => {
                eachOne.destroy()
            })
            this.createKeyboardControls();
            // remove this handler to save memory 
            document.removeEventListener('click', handler, false)
        }
        // this is to enable web audio when page is clicked
        document.addEventListener('click', handler)

    }
    makeBubble(x: number, y: number) {

        let text = 'bubble3'
        let t = this.physics.add.sprite(x + 10, y - 10, text)
            .setVelocityY(Phaser.Math.Between(-300, 300))
            .setCollideWorldBounds(true).setOrigin(0)
            .setVelocityX(Phaser.Math.Between(-150, 150))
            .setBounce(.5).setDepth(4).setTintFill(generateColor()) as Phaser.GameObjects.Sprite
          
        this.bubbles.push(t)

    }
    createKeyboardControls() {
        const delay = new Delay(.01).toDestination();
        this.cpLogo = this.add.image(1220, 655, 'codeplantsmall').setScale(.25).setOrigin(0).setDepth(4)
        this.drumMachine = new DrumMachine(this, 25, 25, this.helpText, this.logText);
        this.synth = new FMSynth({ volume: -20 }).toDestination()
        this.keys = new KeyBoard(this, 530, 265, null, delay, this.synth, this.helpText, this.logText).setDepth(1)
        this.bassPlayer_ = new BassPlayer(this, 25, 440, this.helpText, this.logText);
        this.transport_ = new TransportControl(this, 1050, 525, this.helpText)
        this.effects = new EffectControls(this, 750, 525, this.drumMachine.getPlayers(), this.bassPlayer_.getSynth(), this.keys, this.helpText)
        this.patterns = new PatternManager(this, 700, 25, this.drumMachine, this.helpText)
        this.bassPatterns = new BassPatternManager(this, 700, 85, this.bassPlayer_, this.helpText)
        // this.helpLayer = new HelpLayer(this, 0,0, this.helpText);
        this.looper = new Looper(this, 475, 135, this.bassPatterns, this.patterns, this.drumMachine, this.bassPlayer_, this.helpText);

    }
    
    update() {
        if (this.effects && this.keys && this.bassPlayer_ && this.transport_ && this.drumMachine) {
            this.effects.update();
            this.keys.update();
            this.bassPlayer_.update();
            this.transport_.update();
            this.drumMachine.update()
        }

    }
}
