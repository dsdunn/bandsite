import {
  S3Client,
  CreateBucketCommand,
  PutObjectCommand,
  ListObjectsV2Command,
  CopyObjectCommand,
  GetObjectCommand,
  DeleteObjectsCommand,
  DeleteBucketCommand,
} from "@aws-sdk/client-s3";

const s3 = new S3Client({});

const bucketName = 'band-media-bucket'

// const isAllowedFile = (size, mimeType) => { // some validation code }

export const listAllObjects = async () => {
  try {
    let isTruncated = true;
    const command = new ListObjectsV2Command({
      Bucket: bucketName
    });

    console.log("Your bucket contains the following objects:\n")
    let contents = "";

    while (isTruncated) {
      const { Contents, IsTruncated, NextContinuationToken } = await s3.send(command);
      const contentsList = Contents.map((c) => ` • ${c.Key}`).join("\n");
      contents += contentsList + "\n";
      isTruncated = IsTruncated;
      command.input.ContinuationToken = NextContinuationToken;
    }
    console.log(contents);
    return contents;
  } catch (err) {
    console.log(err);
    return err;
  }
}

// export const uploadObject = async (bucket, key, buffer, mimeType) => {
  // const obj = await s3.send(
  //   new GetObjectCommand({ Bucket: bucketName, Key: key })
  // );
  // return new Promise((resolve, reject) => {
  //   s3.upload(
  //     { Bucket: bucket, Key: key, Body: buffer, ContentType: mimeType },
  //     function (err, data) {
  //       if (err) reject(err);
  //       resolve(data);
  //     });
  // });
// }

export const deleteObject = async (key) => {
  const listObjectsCommand = new ListObjectsV2Command({ Bucket: bucketName });
  const { Contents } = await s3.send(listObjectsCommand);
  const keys = Contents.map((c) => c.Key);

  const deleteObjectsCommand = new DeleteObjectsCommand({
    Bucket: bucketName,
    Delete: { Objects: keys.map((key) => ({ Key: key })) },
  });
  await s3.send(deleteObjectsCommand);
}


// const resize = (buffer, mimeType, width) =>
//     new Promise((resolve, reject) => {
//         Jimp.read(buffer)
//         .then(image => image.resize(width, Jimp.AUTO).quality(70).getBufferAsync(mimeType))
//         .then(resizedBuffer => resolve(resizedBuffer))
//         .catch(error => reject(error))
//     })


