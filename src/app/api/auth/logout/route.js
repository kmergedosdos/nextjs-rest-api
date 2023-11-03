import connectMongoDB from "@/libs/mongodb";
import Token from "@/models/token";
import { headerHelper } from "@/utils/headerHelper";
import { ACTION_RESTRICTED, BEARER_HEADER } from "@/utils/constants";
import { responseFormatter } from "@/utils/responseHelper";
import { NextResponse } from "next/server";

export async function POST(request){
    var response = null;
    try {
        const token = headerHelper(request.headers, BEARER_HEADER);
        if(token!= null){
            await connectMongoDB();
            const isTokenDeleted = await deleteToken(token); 
            if(isTokenDeleted === "Token does not exist!"){
                response = responseFormatter(ACTION_RESTRICTED);
            }else if (isTokenDeleted === true){
                response = responseFormatter({message:"Logged out successfully!"});
            }else{
                response = responseFormatter(isTokenDeleted);
            }
        }else{
            response = responseFormatter(ACTION_RESTRICTED);
        }
    } catch (error) {
        response = responseFormatter({message:error.message});
    }
    return NextResponse.json(response);
}

async function deleteToken(token){
    var response = null;
    try {
        const result = await Token.findOneAndDelete({bearer_token:token});
        result === null ? response = {message:"Token does not exist!"} : response = true;
    } catch (error) {
        response = error.message;
    }
    return response;
}
