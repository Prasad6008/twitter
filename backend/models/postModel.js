import mongoose from "mongoose"

const postSchema = mongoose.Schema(
    {
        postOwner:
        {
            type: mongoose.Schema.Types.ObjectId ,
            ref : "User",
            required : true
        },
        text:
        {
            type: String
        },
        img: 
        {
            type : String
        },
        likes:
        [
            {
                type : mongoose.Schema.Types.ObjectId,
                ref  : "User"
            }
        ],
        comments :
        [
            {
                commentedOwner : 
                {
                    type : mongoose.Schema.Types.ObjectId,
                    ref  : 'User',
                    required : true
                },
                comment : 
                {
                    type : String,
                    required : true
                }
                
            }

        ]
    },{timestamps : true}
)

const postModel = mongoose.model("Post",postSchema)

export default postModel