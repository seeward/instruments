import 'phaser';
export default class Metronome extends Phaser.GameObjects.Container {
    running: boolean;
    delay: number;
    metronomeControls: Phaser.GameObjects.Rectangle;
    bpm: number;
    slider: Phaser.GameObjects.Ellipse;
    bpmText: Phaser.GameObjects.Text;
    width: number;
    height: number;
    tooltip: Phaser.GameObjects.Text;
    helpText: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, x: number, y: number, bpm?: number, width?: number, height?: number, helpText?: Phaser.GameObjects.Text);
    addBPMControl(): void;
    convertPointerToBpm(pointerY: any): number;
    start(): void;
    stop(): void;
    createControls(t: any): void;
    update(): void;
}
