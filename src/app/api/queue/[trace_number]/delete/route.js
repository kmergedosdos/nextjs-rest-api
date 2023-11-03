import connectMongoDB from "@/libs/mongodb";
import Queue from "@/models/queue";
import { authenticator } from "@/utils/authenticator";
import {
  ACTION_RESTRICTED,
  BEARER_HEADER,
  EMPTY_DATA,
} from "@/utils/constants";
import { headerHelper } from "@/utils/headerHelper";
import { responseFormatter } from "@/utils/responseHelper";
import { NextResponse } from "next/server";

export async function DELETE(request, { params }) {
  var response = null;
  try {
    const { trace_number } = params;
    const token = headerHelper(request.headers, BEARER_HEADER);
    if (token != null) {
      await connectMongoDB();
      const authenticate = authenticator(token);
      if (authenticate) {
        const result = await Queue.findOneAndDelete({
          trace_number: trace_number,
        });
        if (result) {
          response = responseFormatter(
            { message: "Removed successfully!" },
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
    response = responseFormatter(error.message, false, 400);
  }

  return NextResponse.json(response);
}
