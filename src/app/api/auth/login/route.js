import connectMongoDB from "@/libs/mongodb";
import User from "@/models/user";
import { NextResponse } from "next/server";
import bcrypt from 'bcrypt';
import { responseFormatter } from "@/utils/responseHelper";
import jwt from 'jsonwebtoken';
import { generateTraceNumber } from "@/utils/traceNumberGenerator";
import Token from "@/models/token";

export async function POST(request){
    var response = null;
    try {
        const {email, password} = await request.json();
        await connectMongoDB();
        const result = await User.findOne({email: email}, {password:1, permission:1});
        if(result){
            const KEY = generateTraceNumber();
            const match = await bcrypt.compare(password, result.password);
            if(match) {
               const token = await jwt.sign({
                    email,
                    isVerified:true
                }, KEY);
                await Token.create({user_id:result._id, bearer_token:token, status:true});
               response = responseFormatter({token:token, email, permission:result.permission});
            }else{
                response = responseFormatter({message:"Password Incorrect!"});
            }
        }else{
            response = responseFormatter({message:"User does not exist!"});
        }
    } catch (error) {
        response = responseFormatter({message:error.message});
    }
    return NextResponse.json(response);
}