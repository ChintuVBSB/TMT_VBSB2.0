import mongoose from 'mongoose'
import config from '../config/config.js'


const connectdb = ()=>{
    mongoose.connect(config.MONGO_URI)
    .then(()=>{
        console.log("Connected to database")
    })
    .catch(error=>{
        console.log(error.message)
    })
} 

export default connectdb