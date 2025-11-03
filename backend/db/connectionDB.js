import mongoose from 'mongoose'

const connectDB = async() =>
{
    try
    {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log('MongoDB connected')
    }catch(err)
    {
        console.log(`Error in connecting DB ${err}`)
        process.exit(1) //To stop the process (1) means true
    }
}

export default connectDB