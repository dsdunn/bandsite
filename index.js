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

export const getHandler = async (event, context) => {
  const { bandId } = event.pathParameters;

  try {
    const response = await dynamo.send(
      new GetCommand({
        TableName: tableName,
        Key: {
            id: bandId,
        },
      })
    );

    return {
      status: 200,
      event,
      band: response.item || 'can\'t be found'
    };
  } catch (error) {
    return {
      status: 500,
      error,
      event
    }
  }
};

export const putHandler = async (event, context) => {
  const bandId = getBandId(event);
  let item = JSON.parse(event.body);

  try {
    const response = await dynamo.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          id: bandId,
          ...item
        }
      })
    );

    return {
      status: 200,
      event,
      band: response.item
    };
  } catch (error) {
    return {
      status: 500,
      error
    }
  }
}

export const deleteHandler = async (event, context) => {
  try {
    const response = await dynamo.send(
      new DeleteCommand({
          TableName: tableName,
          Key: {
              id: bandId
          }
      })
    );

    return {
      status: 200,
      event,
      band: response.item
    };
  } catch (error) {
    return {
      status: 500,
      error
    }
  }
}
