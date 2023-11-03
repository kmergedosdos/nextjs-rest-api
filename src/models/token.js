import mongoose, { Schema } from "mongoose";

const tokenSchema = new Schema(
    {
        user_id:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        bearer_token:{
            type:String,
            index:true
        },
        status: Boolean
    },
    {
        timestamps:true
    }
)
const Token = mongoose.models.Token || mongoose.model("Token", tokenSchema);
export default Token;