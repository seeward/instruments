import 'phaser'
import drumPad from './drumPad';
import {generateColor} from '../helpers/PhaserHelpers';

export default class BassPlayer extends Phaser.GameObjects.Container {
    bg: Phaser.GameObjects.Rectangle;

    constructor(scene: Phaser.Scene, x: number, y: number){
        super(scene,x,y);

        this.makeControlSurface();
        this.scene.add.existing(this);
    }

    makeControlSurface(){
        this.bg = this.scene.add.rectangle(this.x, this.y, 410, 350, generateColor(), .75).setOrigin(0).setDepth(1)
        .setStrokeStyle(3, 0x0000, 1)
    }

    update(){

    }
}

