import mongoose, {Schema} from "mongoose";

const submissionSchema = new Schema(
    {
        ig_account_id:{
            type:String,
            index:true
        },
        caption: String,
        tag:String,
        photos:String,
        status:{
            type:String,
            enum:['in_queue','blocked', 'published']
        },
        delete_flg: Boolean
    },
    {
        timestamps: true
    }
)
const Submission = mongoose.models.Submission || mongoose.model("Submission", submissionSchema);
export default Submission;