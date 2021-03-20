export default class HelpLayer extends Phaser.GameObjects.Container {
    keyboardHelp: Phaser.GameObjects.Rectangle;
    constructor(scene: Phaser.Scene, x: number, y: number, helpText?: Phaser.GameObjects.Text, logText?: Phaser.GameObjects.Text);
    createHelpLayer(): void;
}
