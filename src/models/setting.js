import mongoose, { Schema } from "mongoose";

const settingSchema = new Schema(
    {
        prio_posts_limit:Number,
        non_prio_posts_limit:Number
    },
    {
        timestamps:true
    }
) 

const Settings = mongoose.models.Settings || mongoose.model("Settings", settingSchema);
export default Settings;