

export default class HelpLayer extends Phaser.GameObjects.Container {

    keyboardHelp: Phaser.GameObjects.Rectangle;
    
    constructor(scene: Phaser.Scene, x: number, y: number, helpText?: Phaser.GameObjects.Text, logText?: Phaser.GameObjects.Text) {
        super(scene, x, y);

        this.createHelpLayer();
        this.scene.add.existing(this);
    }

    createHelpLayer(){
        this.keyboardHelp = this.scene.add.rectangle(20,20,475,475, 0xffffff, .75).setOrigin(0).setDepth(5)

    }
}