export declare enum Pads {
    pad0 = 0,
    pad1 = 1,
    pad2 = 2,
    pad3 = 3,
    pad4 = 4,
    pad5 = 5
}
export default class CustomSampler extends Phaser.GameObjects.Container {
    pad0: Phaser.GameObjects.Rectangle;
    pad1: Phaser.GameObjects.Rectangle;
    pad2: Phaser.GameObjects.Rectangle;
    pad3: Phaser.GameObjects.Rectangle;
    pad4: Phaser.GameObjects.Rectangle;
    pad5: Phaser.GameObjects.Rectangle;
    activePad: number | undefined;
    pads: string[];
    muted: boolean;
    helpText: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, x: number, y: number, helpText?: Phaser.GameObjects.Text);
    createSamplerControls(): void;
    muteAllPads(): void;
    unMuteAllPads(): void;
    update(): void;
}
