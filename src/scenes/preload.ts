

import 'phaser';

export default class PreloadScene extends Phaser.Scene {


    constructor() {
        super({ key: "PreloadScene" });
    }
    preload() {

        
        var assetText = this.make.text({
            x: 400,
            y: 400 - 50,
            text: '',
            style: {
                color: '#000000'
            }
        });
        
        // assetText.setText('Loading assets');
        this.load.on('filecomplete', function (key, type, data) {
            console.log(data)
            assetText.setText('Loading assets: ' + key);
        });
        this.load.on('complete', function () {
            console.log('complete');
            assetText.destroy();
            this.scene.start('DashboardScene')
        }, this);


        this.load.image('bubble', '/assets/bubble.png')
        this.load.image('bubble2', '/assets/bubble2.png')
        this.load.image('bubble3', '/assets/bubble3.png')

    }

    create() {

    }

    update() {


    }
}
