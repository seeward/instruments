import 'phaser';
import { generateColor } from '../helpers/PhaserHelpers';
import DrumMachine from '../components/drumMachine';
import TransportControl from '../components/transportControl';

export default class DrumMachineScene extends Phaser.Scene {
  private helpText: Phaser.GameObjects.Text;
  private logText: Phaser.GameObjects.Text;
  private drumMachine: DrumMachine;
  private transport: TransportControl;

  constructor() {
    super({ key: 'DrumMachineScene' });
  }

  create() {
    this.add.rectangle(0, 0, 1280, 720, generateColor(), 0.15).setOrigin(0);

    this.helpText = this.add
      .text(30, 25, 'Load a seed pattern then press AI to create a new beat.', {
        fontSize: '22px',
        color: '#000000',
      })
      .setDepth(2);

    this.logText = this.add
      .text(30, 55, 'Starter patterns ready. Press Play to hear them.', {
        fontSize: '14px',
        color: '#000000',
      })
      .setDepth(2);

    this.drumMachine = new DrumMachine(this, 30, 110, this.helpText, this.logText);

    this.transport = new TransportControl(this, 1020, 575, this.helpText);

    // Load a default groove so the AI generator has a seed to build from.
    this.drumMachine.loadSeq('PATTERN_Rock Beat 1');
    this.helpText.setText('Press Play to listen, then tap AI to generate a new beat.');
  }

  update() {
    this.drumMachine?.update();
    this.transport?.update();
  }
}
