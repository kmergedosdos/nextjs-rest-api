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
import { generateTraceNumber } from "@/utils/traceNumberGenerator";
import { NextResponse } from "next/server";

// GET all queue from database
export async function GET(request) {
  var response = null;
  try {
    const token = headerHelper(request.headers, BEARER_HEADER);
    if (token != null) {
      await connectMongoDB();
      const authenticate = await authenticator(token);
      if (authenticate) {
        const data = await Queue.find().sort({position:1});
        data === null || data.length === 0
          ? (response = responseFormatter(EMPTY_DATA))
          : (response = responseFormatter(data, true, 200));
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

// POST method for creation and insertion of Queues into database
export async function POST(request) {
  var response = null;
  try {
    const token = headerHelper(request.headers, BEARER_HEADER);
    if (token != null) {
      await connectMongoDB();
      const authenticate = await authenticator(token);
      if (authenticate) {
        const { submission_id, priority, ig_account_id } = await request.json();
        //Generate trace number
        const generatedTraceNumber = generateTraceNumber();
        //Get Queues by ig_account_id with sort by position
        const position = await getQueueByIgAccountId(ig_account_id);
        if (typeof position === "number") {
          const data = await Queue.create({
            submission_id,
            ig_account_id,
            position,
            priority,
            trace_number: generatedTraceNumber,
          });
          response = responseFormatter(data, true, 200);
        } else {
          response = responseFormatter({ message: position });
        }
      } else {
        response = responseFormatter(ACTION_RESTRICTED);
      }
    } else {
      response = responseFormatter(ACTION_RESTRICTED);
    }
  } catch (error) {
    request = responseFormatter(error.message, false, 400);
  }
  return NextResponse.json(response);
}

// get queue by ig_account_id and returning its desired position
async function getQueueByIgAccountId(account_id) {
  try {
    const response = await Queue.findOne({ ig_account_id: account_id }).sort({
      position: -1,
    });
    var storePosition = 0;
    //If empty set position as 1; if not plus one of the max position
    response === null
      ? (storePosition = 1)
      : (storePosition = response.position + 1);
    return storePosition;
  } catch (error) {
    return error.message;
  }
}
