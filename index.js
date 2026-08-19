import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { CognitoJwtVerifier } from "aws-jwt-verify";

import { listAllObjects, deleteObject } from './s3.js';

const client = new DynamoDBClient({});

const dynamo = DynamoDBDocumentClient.from(client);

const tableName = 'bandsite-table';


// Verifier that expects valid access tokens:
const verifier = CognitoJwtVerifier.create({
  userPoolId: "us-west-2_1zzVr4BXm",
  tokenUse: "access",
  clientId: "4sb4pk05206tebsb8um1o2ecr2",
});

const isValidToken = async (token) => {
  try {
    const payload = await verifier.verify(token);
    console.log("Token is valid. Payload:", payload);
    return true;
  } catch (e){
    console.log("Token not valid!", e);
    return false;
  }
}

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

    const { Item, $metadata } = response;

    return Item;
  } catch (error) {
    return error;
  }
};

export const putHandler = async (event, context) => {
  const { bandId } = event.pathParameters;
  const token = event.headers.authorization;

  if (!isValidToken(token)) {
    return {
      status: 403,
      message: 'Unauthorized'
    }
  }
  
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
      dynamoResponseCode: $metadata.httpStatusCode,
      band: Item
    };
  } catch (error) {
    return error
  }
}

export const deleteHandler = async (event, context) => {
  const { bandId } = event.pathParameters;

  const token = event.headers.authorization;

  if (!isValidToken(token)) {
    return {
      status: 403,
      message: 'Unauthorized'
    }
  }

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