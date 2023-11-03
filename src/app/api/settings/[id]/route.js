import connectMongoDB from "@/libs/mongodb";
import Settings from "@/models/setting";
import { authenticator } from "@/utils/authenticator";
import {
  ACTION_RESTRICTED,
  BEARER_HEADER,
  EMPTY_DATA,
} from "@/utils/constants";
import { headerHelper } from "@/utils/headerHelper";
import { responseFormatter } from "@/utils/responseHelper";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  var response = null;
  try {
    const { id } = params;
    const token = headerHelper(request.headers, BEARER_HEADER);
    if (token != null) {
      await connectMongoDB();
      const authenticate = authenticator(token);
      if (authenticate) {
        const result = await Settings.findOne({ _id: id });
        if (result) {
          response = responseFormatter(result, true, 200);
        } else {
          response = responseFormatter(EMPTY_DATA);
        }
      } else {
        response = responseFormatter(ACTION_RESTRICTED);
      }
    } else {
      response = responseFormatter(ACTION_RESTRICTED);
    }
  } catch (error) {
    response = responseFormatter({ message: error.message });
  }

  return NextResponse.json(response);
}

export async function PUT(request, { params }) {
  var response = null;
  try {
    const token = headerHelper(request.headers, BEARER_HEADER);
    if (token != null) {
      await connectMongoDB();
      const authenticate = authenticator(token);
      if (authenticate) {
        const requestBody = await request.json();
        const { id } = params;
        const result = await Settings.findByIdAndUpdate(id, requestBody);
        if (result) {
          response = responseFormatter(result, true, 200);
        } else {
          response = responseFormatter(EMPTY_DATA);
        }
      } else {
        response = responseFormatter(ACTION_RESTRICTED);
      }
    } else {
      response = responseFormatter(ACTION_RESTRICTED);
    }
  } catch (error) {
    response  = responseFormatter({message:error.message});
  }

  return NextResponse.json(response);
}
