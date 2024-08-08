declare module 'helmet' {
    import { RequestHandler } from 'express'
    function helmet(): RequestHandler
    export = helmet
}
