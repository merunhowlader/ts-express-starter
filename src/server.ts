import {createServer as createHttpServer , type Server} from 'node:http';
import {createApp} from './app/app.js';


export function createServer():Server{
    const app = createApp();
    const server =createHttpServer(app);
    return server;
}

