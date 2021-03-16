import { generateColor } from "../helpers/PhaserHelpers";
import DrumMachine from "./drumMachine";
import PatternPad from "./patternPad";


export default class PatternManager extends Phaser.GameObjects.Container {
    drumMachine: DrumMachine;
    helpText: Phaser.GameObjects.Text;
    pads: PatternPad[] = [];
    resetBtn: Phaser.GameObjects.Ellipse;


    constructor(scene: Phaser.Scene, x: number, y: number, drumMachine?: DrumMachine, helpText?: Phaser.GameObjects.Text, logText?: Phaser.GameObjects.Text) {
        super(scene, x, y);
        this.helpText = helpText
        this.drumMachine = drumMachine
        this.addPads();
        this.scene.add.existing(this);
    }

    addPads() {
        this.resetBtn = this.scene.add.ellipse(this.x - 25, this.y, 20,20, generateColor(), 1).setOrigin(0).setDepth(3)
        .setInteractive({useHandCursor: true})
        .on("pointerdown", () => {
            this.pads.forEach((eachPad)=>{
                eachPad.clearPattern();
            })

        }).setStrokeStyle(2, 0x00000, 1)
        .on('pointerover', () => {
            this.helpText.setText("Reset all pads")
        })
        .on('pointerout', () => {
            this.helpText.setText("")
        })
        let hSpace = 0
        for (var i = 0; i < 6; i++) {
            this.pads.push(new PatternPad(this.scene, this.x + hSpace, this.y, this.drumMachine, this.helpText));
            hSpace += 55
        }

    }
}