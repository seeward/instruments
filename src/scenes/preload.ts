

import 'phaser';

export default class PreloadScene extends Phaser.Scene {


    constructor() {
        super({ key: "PreloadScene" });
    }
    preload() {

        var progressBar = this.add.graphics();
        var progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(400, 400, 320, 50);
        var assetText = this.make.text({
            x: 400,
            y: 400 - 50,
            text: '',
            style: {
                color: '#000000'
            }
        });
        this.load.on('progress', function (value) {
            // console.log(value);
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(400, 400 + 10, 300 * value, 30);
        }, this);
        // assetText.setText('Loading assets');
        this.load.on('filecomplete', function (key, type, data) {
            console.log(data)
            assetText.setText('Loading assets: ' + key);
        });
        this.load.on('complete', function () {
            console.log('complete');
            progressBar.destroy();
            progressBox.destroy();
            assetText.destroy();
            this.scene.start('DashboardScene')
        }, this);


        this.load.audio('kick', '/assets/kick.wav')
        this.load.audio('snare', '/assets/snare.wav')
        this.load.audio('hat', '/assets/hat1.wav')
        this.load.audio('hat2', '/assets/hat2.wav')
        this.load.audio('ride', '/assets/ride.wav')
        this.load.image('bubble', '/assets/bubble.png')
        this.load.image('bubble2', '/assets/bubble2.png')
        this.load.image('bubble3', '/assets/bubble3.png')
        this.load.image('bg', '/assets/3.jpg')
        this.load.image('loading', '/assets/loading.gif')

    }

    create() {

    }

    update() {


    }
}
