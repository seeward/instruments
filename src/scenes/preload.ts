

import 'phaser';

export default class PreloadScene extends Phaser.Scene {


    constructor() {
        super({ key: "PreloadScene" });
    }
    preload() {

        
        var assetText = this.make.text({
            x: 400,
            y: 400 - 50,
            text: 'Loading Assets',
            style: {
                color: '#000000'
            }
        });

        var progressBar = this.add.graphics();
        var progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(400, 400, 320, 50);
        
        this.load.on('progress', function (value) {
            // console.log(value);
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(400, 400 + 10, 300 * value, 30);
        }, this);
        // assetText.setText('Loading assets');
        this.load.on('filecomplete', function (key, type, data) {
            //console.log(data)
            assetText.setText('Loading assets: ' + key);
        });
        this.load.on('complete', function () {
            //console.log('complete');
            assetText.destroy();
            this.scene.start('DashboardScene')
        }, this);


        this.load.image('bubble', '/assets/bubble.png')
        this.load.image('bubble2', '/assets/bubble2.png')
        this.load.image('bubble3', '/assets/bubble3.png')
        this.load.image('tone', '/assets/tone.png')
        this.load.image('magenta', '/assets/mjs.png')
        this.load.image('phaser', '/assets/phaser.png')
        this.load.image('codeplant', '/assets/cplogo.png')
        this.load.image('codeplantsmall', '/assets/cplogo2.png')
        this.load.image('typescript', '/assets/ts.png')
        this.load.image('webmidi', '/assets/webmidi.png')


        this.load.image('play', '/assets/play.png')
        this.load.image('pause', '/assets/pause.png')
        this.load.image('stop', '/assets/stop.png')
        this.load.image('record', '/assets/record.png')
      


    }

    create() {

    }

    update() {


    }
}
