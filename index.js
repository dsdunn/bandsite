import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});

const dynamo = DynamoDBDocumentClient.from(client);

const tableName = "bandsite-table";

export const handler = async (event, context) => {
  const { method, path } = event.requestContext?.http;
  const bandId = path.slice(1);
  const routeKey = `${method} ${path}`;
  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    switch (method) {
      case "DELETE":
        await dynamo.send(
          new DeleteCommand({
            TableName: tableName,
            Key: {
              id: bandId,
            },
          })
        );
        body = `Deleted item ${bandId}`;
        break;
      case "GET":
        if (!bandId) {
          throw new Error("specify a bandId in the path");
        }
        body = await dynamo.send(
          new GetCommand({
            TableName: tableName,
            Key: {
              id: bandId,
            },
          })
        );
        body = body.Item;
        break;
      case "PUT":
        let requestJSON = JSON.parse(event.body);
  
        const response = await dynamo.send(
          new PutCommand({
            TableName: tableName,
            Item: {
              id: bandId,
              name: requestJSON.name || bandId,
              shows: requestJSON.shows || [],
            },
          })
        );
        body = `Put item response: ${response}`;
        break;
      default:
        throw new Error(`Unsupported path: "${event.rawPath}"`);
    }
  } catch (err) {
    statusCode = 400;
    body = err.message;
  } finally {
    body = JSON.stringify(body);
  }

  return {
    statusCode,
    body,
    headers,
  }
};
