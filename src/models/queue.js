import mongoose, { Schema } from "mongoose";


const queueSchema = new Schema(
    {
        submission_id:{
            type: Schema.Types.ObjectId,
            ref:'Submission',
            required: true
        },
        ig_account_id: {
            type:String,
            index:true
        },
        position: Number,
        priority: Boolean,
        trace_number:{
            type:String,
            index:true
        },
        delete_flg: Boolean
    },
    {
        timestamps: true
    }
)
const Queue = mongoose.models.Queue || mongoose.model("Queue", queueSchema);
export default Queue;