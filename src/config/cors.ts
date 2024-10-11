import { CorsOptions} from 'cors'

export const corsConfig: CorsOptions = {
    origin: function (origin, callback) {
        const whitelist = [process.env.FRONTEND_URL]
        if(process.argv[2] == '--api'){
            whitelist.push(undefined)
        }
        if(whitelist.includes(origin)){
            return callback(null, true) // Null means no errors, true means allowed
        } else {
            return callback(new Error('Not allowed by CORS'))
        }
    }
}