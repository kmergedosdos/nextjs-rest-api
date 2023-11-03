import connectMongoDB from "@/libs/mongodb";
import Settings from "@/models/setting";
import { authenticator } from "@/utils/authenticator";
import { ACTION_RESTRICTED, BEARER_HEADER } from "@/utils/constants";
import { headerHelper } from "@/utils/headerHelper";
import { responseFormatter } from "@/utils/responseHelper";
import { NextResponse } from "next/server";

export async function POST(request){
    var response = null;
    try {
        const token = headerHelper(request.headers, BEARER_HEADER);
        if(token!=null){
            await connectMongoDB();
            const authenticate = await authenticator(token);
            if(authenticate){
                const {prio_posts_limit, non_prio_posts_limit} = await request.json();
                const result = await Settings.create({prio_posts_limit, non_prio_posts_limit});
                if(result){
                    response = responseFormatter(result, true, 200);
                }else{
                    response = responseFormatter(ACTION_RESTRICTED);
                }
            }else{
                response = responseFormatter(ACTION_RESTRICTED);
            }
        }else{
            response = responseFormatter(ACTION_RESTRICTED);
        }
    } catch (error) {
        response = responseFormatter({message:error.message})
    }

    return NextResponse.json(response);
}