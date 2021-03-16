import { generateColor } from "../helpers/PhaserHelpers";
import DrumMachine from "./drumMachine";
import PatternManager from "./patternManager";
import BassPatternPad from "./bassPatternPad";
import BassPlayer from "./bassPlayer";


export default class BassPatternManager extends PatternManager {

    helpText: Phaser.GameObjects.Text;
    pads: BassPatternPad[] = [];
    resetBtn: Phaser.GameObjects.Ellipse;
    size: string;
    bassPlayer: BassPlayer;


    constructor(scene: Phaser.Scene, x: number, y: number, drumMachine?: BassPlayer, helpText?: Phaser.GameObjects.Text, size: string = '50') {
        super(scene, x, y);
        this.helpText = helpText
        this.bassPlayer = drumMachine
        this.size = size
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
            this.pads.push(new BassPatternPad(this.scene, this.x + hSpace, this.y, this.bassPlayer, this.helpText));
            hSpace += 30
        }

    }
}