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

//POST method for submission creation
export async function POST(request) {
  var response = null;

  try {
    const { ig_account_id, caption, tag, photos, status, delete_flg } =
      await request.json();
    const token = headerHelper(request.headers, BEARER_HEADER);
    if (token != null) {
      await connectMongoDB();
      const authenticate = authenticator(token);
      if (authenticate) {
        //insertion of submission data to database
        const res = await Submission.create({
          ig_account_id,
          caption,
          tag,
          photos,
          status,
          delete_flg,
        });
        response = responseFormatter(res, true, 200);
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

// GET Submissions from database
export async function GET(request) {
  var response = null;
  try {
    const token = headerHelper(request.headers, BEARER_HEADER);
    if (token != null) {
      await connectMongoDB();
      const authenticate = authenticator(token);
      if (authenticate) {
        const res = await Submission.find({ delete_flg: false });
        if (res) {
          response = responseFormatter(res, true, 200);
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
