import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

import { listAllObjects, deleteObject } from './s3.js';

const client = new DynamoDBClient({});

const dynamo = DynamoDBDocumentClient.from(client);

const tableName = 'bandsite-table';
const bucketName = 'band-media-bucket'
const bucketUrl = 'https://band-media-bucket.s3.us-west-2.amazonaws.com/'

const buildImageUrl = (bandName, fileName) => `${bucketUrl}${bucketName}/${bandId}/${fileName}`;

export const getHandler = async (event, context) => {
  console.log(event);
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

    // const images = await listAllObjects();

    const { Item, $metadata } = response;
    const { id, name, shows, images } = Item;
    return {
      status: 200,
      band: {
        id,
        name,
        shows,
        images
      }
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
  const { bandId } = event.pathParameters;

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

    const { Item, $metadata } = response;

    return {
      status: 200,
      event,
      dynamoResponseCode: $metadata.httpStatusCode,
      band: Item
    };
  } catch (error) {
    return {
      status: 500,
      error
    }
  }
}

export const deleteHandler = async (event, context) => {
  const { bandId } = event.pathParameters;

  try {
    const response = await dynamo.send(
      new DeleteCommand({
          TableName: tableName,
          Key: {
              id: bandId
          }
      })
    );

    const { Item, $metadata } = response;

    return {
      status: 200,
      event,
      dynamoResponseCode: $metadata.httpStatusCode,
      band: Item
    };
  } catch (error) {
    return {
      status: 500,
      error
    }
  }
}