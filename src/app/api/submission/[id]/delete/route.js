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

//REMOVE or RETRIEVE Post data by updating isRemoved status
export async function PUT(request, { params }) {
  var response = null;
  try {
    const { id } = params;
    const { delete_flg } = await request.json();
    const token = headerHelper(request.headers, BEARER_HEADER);
    if (token != null) {
      await connectMongoDB;
      const authenticate = authenticator(token);
      if (authenticate) {
        const result = await Submission.findByIdAndUpdate(id, { delete_flg });
        if (result) {
          response =
            delete_flg == true
              ? responseFormatter(
                  { message: "Post removed successfully!" },
                  true,
                  200
                )
              : responseFormatter(
                  { message: "Post restrieved successfully" },
                  true,
                  200
                );
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
    response = responseFormatter(error.message);
  }

  return NextResponse.json(response);
}
