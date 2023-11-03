import connectMongoDB from "@/libs/mongodb";
import Submission from "@/models/submission";
import { authenticator } from "@/utils/authenticator";
import {
  ACTION_RESTRICTED,
  BEARER_HEADER,
  EMPTY_DATA,
} from "@/utils/constants";
import { headerHelper } from "@/utils/headerHelper";
import { responseFormatter } from "@/utils/responseHelper";
import { NextResponse } from "next/server";

//UPDATE Submission
export async function PUT(request, { params }) {
  var response = null;
  try {
    const { id } = params;
    const requestToUpdate = await request.json();
    const token = headerHelper(request.headers, BEARER_HEADER);
    if (token != null) {
      await connectMongoDB();
      const authenticate = authenticator(token);
      if (authenticate) {
        const data = await Submission.findByIdAndUpdate(id, requestToUpdate);
        if (data) {
          response = responseFormatter(data, true, 200);
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
    response = responseFormatter(error.message, false, 400);
  }

  return NextResponse.json(response);
}

//GET specific Submission by ID
export async function GET(request, { params }) {
  var response = null;
  try {
    const { id } = params;
    const token = headerHelper(request.headers, BEARER_HEADER);
    if (token != null) {
      await connectMongoDB();
      const authenticate = authenticator(token);
      if (authenticate) {
        const data = await Submission.findOne({ _id: id, delete_flg: false });
        if (data) {
          response = responseFormatter(data, true, 200);
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
    response = responseFormatter(error.message, false, 400);
  }

  return NextResponse.json(response);
}
