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
    getPads(){
        let pds = []
        this.pads.forEach((eachPad)=>{
            pds.push(eachPad.getPad())
        })
        return pds
    }
    addPads() {
        this.resetBtn = this.scene.add.ellipse(this.x - 20, this.y + 5, 15,15, generateColor(), 1).setOrigin(0).setDepth(3)
        .setInteractive({useHandCursor: true})
        .on("pointerdown", () => {
            this.pads.forEach((eachPad)=>{
                eachPad.clearPattern();
            })

        }).setStrokeStyle(2, 0x00000, .5)
        .on('pointerover', () => {
            this.helpText.setText("Reset all pads")
        })
        .on('pointerout', () => {
            this.helpText.setText("")
        })
        
        let hSpace = 0
        for (var i = 0; i < 11; i++) {
            this.pads.push(new BassPatternPad(this.scene, this.x + hSpace, this.y, this.bassPlayer, this.helpText, null, i));
            hSpace += 30
        }

    }
}