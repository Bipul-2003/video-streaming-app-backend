import { app } from "./app.js";
import connect_DB from "./db/index.js";
import dotenv from 'dotenv'


dotenv.config({ path: './.env' })

connect_DB()
    .then(() => {
        app.on('error', (error) => {
            console.log('ERROR on connecting express !!', error)
            throw error;
        })
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Listning at http://localhost:${process.env.PORT}`)
        })
    })
    .catch((error) => console.log('MongoDB connection failed !!', error))