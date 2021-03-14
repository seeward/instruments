import { Channel, Transport } from "tone";
import { theWindow } from "tone/build/esm/core/context/AudioContext";
import { generateColor } from "../helpers/PhaserHelpers";
import Metronome from "./metronome";


export default class TransportControl extends Phaser.GameObjects.Container {

    helpText: Phaser.GameObjects.Text;
    bg: Phaser.GameObjects.Rectangle;
    location: Phaser.GameObjects.Text;
    playBtn: Phaser.GameObjects.Image;
    pauseBtn: Phaser.GameObjects.Image;
    stopBtn: Phaser.GameObjects.Image;
    channels: Channel[];
    locationText: Phaser.GameObjects.Text;
    locationTextBars: Phaser.GameObjects.Text;
    locationTextBeats: Phaser.GameObjects.Text;
    locationTextSixteenths: Phaser.GameObjects.Text;
    metronome: Metronome;

    constructor(scene: Phaser.Scene, x: number, y: number, helpText?: Phaser.GameObjects.Text) {
        super(scene, x, y);
        this.setHelpText(helpText);
        this.createControls();
        this.scene.add.existing(this);
    }
    setHelpText(helpText: Phaser.GameObjects.Text) {
        this.helpText = helpText
        this.locationTextBars = this.scene.add.text(this.x + 5, this.y + 3,'Bars', {fontSize: '10px', color: '#000000'}).setOrigin(0).setDepth(3)

        this.locationTextBeats = this.scene.add.text(this.x + 50, this.y + 3,'Beats', {fontSize: '10px', color: '#000000'}).setOrigin(0).setDepth(3)

        this.locationTextSixteenths = this.scene.add.text(this.x + 100, this.y + 3,'Sixteenths', {fontSize: '10px', color: '#000000'}).setOrigin(0).setDepth(3)

        this.location = this.scene.add.text(this.x + 15, this.y + 15, Transport.position.toString().split('.')[0], {fontSize: '35px', color: '#000000'}).setOrigin(0).setDepth(3)
    }
    createChannels(){
        
    }
    createControls(){
        this.bg = this.scene.add.rectangle(this.x, this.y,175, 100, 0xffffff, 1).setDepth(2).setOrigin(0)
        .setStrokeStyle(2, 0x000000, 1);
        this.metronome = new Metronome(this.scene, this.bg.x + this.bg.width, this.bg.y, 110, 15 ,this.bg.height, this.helpText);

        this.playBtn = this.scene.add.image(this.bg.x + 5, this.bg.y + 45, 'play').setScale(.5)
            .setDepth(2).setOrigin(0).setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {
                Transport.start();
                })
                .on('pointerover', () => {
                    this.helpText.setText('Start Transport')
                })
                .on('pointerout', () => {
                    this.helpText.setText('')
                })
        this.pauseBtn = this.scene.add.image(this.bg.x + 60, this.bg.y + 45, 'pause')
        .setScale(.5)
                .setDepth(2).setOrigin(0).setInteractive({ useHandCursor: true })
                    .on('pointerdown', () => {
                    Transport.pause();
                    })
                    .on('pointerover', () => {
                        this.helpText.setText('Pause Transport')
                    })
                    .on('pointerout', () => {
                        this.helpText.setText('')
                    })
        this.stopBtn = this.scene.add.image(this.bg.x + 115, this.bg.y + 45, 'stop').setScale(.5)
                    .setDepth(2).setOrigin(0).setInteractive({ useHandCursor: true })
                        .on('pointerdown', () => {
                        Transport.stop();
                        })
                        .on('pointerover', () => {
                            this.helpText.setText('Stop Transport')
                        })
                        .on('pointerout', () => {
                            this.helpText.setText('')
                        })
        
    }
    update(){
        this.metronome.update();
        this.location.setText(Transport.position.toString().split('.')[0])
    }
    
}