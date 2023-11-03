import connectMongoDB from "@/libs/mongodb";
import User from "@/models/user";
import { headerHelper } from "@/utils/headerHelper";
import { responseFormatter } from "@/utils/responseHelper";
import { NextResponse } from "next/server";
import bcrypt from 'bcrypt';
import { ACTION_RESTRICTED, BEARER_HEADER, PERMISSIONS } from "@/utils/constants";

// POST for user creation and insert into database
export async function POST(request){
    var response = null;
    try {
        const token = headerHelper(request.headers, BEARER_HEADER);
        if(token === process.env.SYSTEM_BEARER_TOKEN){
            await connectMongoDB();
            const {username, email, password} = await request.json();
            const result = await User.create({
                username,
                email,
                password: await bcrypt.hash(password, 10),
                permission: PERMISSIONS
            })
            response = responseFormatter(result, true, 200);
        }else{
            response = responseFormatter(ACTION_RESTRICTED, true, 200);
        }
    } catch (error) {
        response = responseFormatter({message:error.mesage}, false, 400);
    }

    return NextResponse.json(response);
}