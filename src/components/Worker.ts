import * as mm from '@magenta/music/es5'
import * as _ from 'lodash-es'

import {MessageManager} from './MessageManager';

let messageManager: MessageManager | null = null;

function executeFunction<T extends MessageManager>(target: T, func: keyof T, args: any): void {
    (target[func] as unknown as Function)(args);
}

self.addEventListener('message', e => {
    const message = e.data || e;

    switch (message.type) {
        case 'init':
            console.log(message)
            messageManager = new MessageManager(message.args);
            break;

        case 'exec':
            if (messageManager) {
                executeFunction(messageManager, message.func, message.args);
            }
            break;

        default:
            break;
    }
});

