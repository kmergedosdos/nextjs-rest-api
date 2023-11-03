import connectMongoDB from "@/libs/mongodb";
import Queue from "@/models/queue";
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
    const { trace_number } = params;
    const token = headerHelper(request.headers, BEARER_HEADER);
    if (token != null) {
      await connectMongoDB();
      const authenticate = await authenticator(token);
      if (authenticate) {
        const data = await Queue.findOne({ trace_number: trace_number });
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
    response = responseFormatter({ message: error.message });
  }

  return NextResponse.json(response);
}

export async function PUT(request, { params }) {
  var response = null;
  try {
    const { trace_number } = params;
    const { ig_account_id } = await request.json();
    const token = headerHelper(request.headers, BEARER_HEADER);
    if (token != null) {
      await connectMongoDB();
      const authenticate = await authenticator(token);
      if (authenticate) {
        const hasPriority = await checkQueueIfHasPriority(
          ig_account_id,
          trace_number
        );
        const oldPosition = await Queue.findOne(
          { trace_number: trace_number },
          { position: 1 }
        );
        if(typeof hasPriority == 'boolean'){
          const result = await updateQueuePositionByIgAccountId(
            ig_account_id,
            trace_number,
            hasPriority,
            oldPosition.position
          );
          if (typeof result == 'boolean') {
            response = responseFormatter({
              message: "Updated positions successfully",
            });
          } else {
            response = result;
          }
        }else{
          response = responseFormatter({message:hasPriority});
        }
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

async function checkQueueIfHasPriority(ig_account_id) {
  var response = null;
  try {
    const query = { ig_account_id: ig_account_id, priority: true };
    const result = await Queue.countDocuments(query);
    if (result > 0) {
      response = true;
    } else {
      response = false;
    }
  } catch (error) {
    response = error.message;
  }
  return response;
}

async function updateQueuePositionByIgAccountId(
  ig_account_id,
  trace_number,
  hasPriority,
  oldPosition
) {
  var response = null;
  try {
    switch (hasPriority) {

      case false:
        const result = await Queue.findOneAndUpdate(
          { trace_number: trace_number },
          { position: 1, priority: true }
        );
        if (result) {
          const filter = {
            trace_number: { $ne: trace_number },
            ig_account_id: ig_account_id,
            $and: [
              { position: { $gt: 0 } },
              { position: { $lt: oldPosition } },
            ],
          };
          const update = {
            $inc: { position: 1 },
          };
          const result = await Queue.updateMany(filter, update);
          if (result.acknowledged) {
            response = true;
          } else {
            response = "Error on executing bulk update";
          }
        } else {
          response = "Error on updating position by trace number";
        }

        break;

        
      case true:
        const settings = await getSettings();

        const prioPostsLimit = await Queue.find({
          ig_account_id,
          priority: true,
        }).sort({ position: -1 });
        const totalPost =
          settings[0].prio_posts_limit + settings[0].non_prio_posts_limit;
        if (settings[0].prio_posts_limit > prioPostsLimit.length) {
          const result = await Queue.findOneAndUpdate(
            { trace_number: trace_number, priority: false },
            { position: prioPostsLimit[0].position + 1, priority: true }
          );
          if (result) {
            const filter = {
              trace_number: { $ne: trace_number },
              ig_account_id: ig_account_id,
              $and: [
                { position: { $gt: prioPostsLimit[0].position } },
                { position: { $lt: oldPosition } },
              ],
            };
            const update = {
              $inc: { position: 1 },
            };
            const result = await Queue.updateMany(filter, update);
            if (result.acknowledged) {
              response = true;
            } else {
              response = "Error on executing bulk update";
            }
          } else {
            response = { message: "Post already been prioritized!" };
          }
        } else {
          const collection = await Queue.find({
            ig_account_id: ig_account_id,
          }).sort({ position: 1 });
          const nonPrioMax = await Queue.findOne({
            ig_account_id: ig_account_id,
            priority: false,
          }).sort({ position: -1 });
          const prioMax = await Queue.findOne({
            ig_account_id: ig_account_id,
            priority: true,
          }).sort({ position: -1 });
          var group = [];
          for (var i = 0; i < collection.length; i += totalPost) {
            group.push(collection.slice(i, i + totalPost));
          }

          // Check if each group contains prio post limit
          var length = 0;
          const checker = group.every((subGroup) => {
            const truePriorityCount = subGroup.filter(
              (obj) => obj.priority === true
            ).length;
            if (
              truePriorityCount < settings[0].prio_posts_limit &&
              truePriorityCount > 0
            ) {
              length = truePriorityCount;
            }
            console.log("true", truePriorityCount);
            console.log("length", length);
            return truePriorityCount === settings[0].prio_posts_limit;
          });
          console.log(checker);
          if (checker) {
            response = {
              message:
                "There's no need for you to prioritize this post because this will be posted as scheduled!",
            };
          } else {
            var res = null;
            var flag = false;
            if (length === 0) {
              flag = true;
              res = await Queue.findOneAndUpdate(
                { trace_number: trace_number, priority: false },
                { position: nonPrioMax.position, priority: true }
              );
            } else {
              res = await Queue.findOneAndUpdate(
                { trace_number: trace_number, priority: false },
                { position: prioMax.position + 1, priority: true }
              );
            }
            if (res) {
              const filter = {
                trace_number: { $ne: trace_number },
                ig_account_id: ig_account_id,
                $and: [
                  {
                    position: {
                      $gt:
                        flag === true ? nonPrioMax.position : prioMax.position,
                    },
                  },
                  { position: { $lt: oldPosition } },
                ],
              };
              const update = {
                $inc: { position: 1 },
              };
              const result = await Queue.updateMany(filter, update);
              if (result.acknowledged) {
                response = true;
              } else {
                response = { message: "Error on executing bulk update" };
              }
            }
            if (res === null) {
              response = { message: "Post already been prioritized!" };
            }
          }
        }
        break;

      default:
        break;
    }
  } catch (error) {
    response = error.message;
  }

  return response;
}

async function getSettings() {
  var response = null;
  try {
    const result = await Settings.find();
    response = result;
  } catch (error) {
    response = error.message;
  }
  return response;
}
