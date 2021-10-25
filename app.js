const AWSXRay = require('aws-xray-sdk');
const XRayExpress = AWSXRay.express;
const express = require('express');

// Capture all AWS clients we create
const AWS = AWSXRay.captureAWS(require('aws-sdk'));
console.log(AWS.config);
AWS.config.update({region: process.env.DEFAULT_AWS_REGION || 'ap-northeast-2'});

// Capture all outgoing https requests
AWSXRay.captureHTTPsGlobal(require('https'));
const https = require('https');

const app = express();
const port = 5000;

app.use(XRayExpress.openSegment('SampleSite'));
app.use(XRayExpress.closeSegment());

app.get('/', (req, res) => {
  const seg = AWSXRay.getSegment();
  const sub = seg.addNewSubsegment('customSubsegment');
  console.log(seg);
  setTimeout(() => {
    sub.close();
    res.sendFile(`${process.cwd()}/index.html`);
  }, 500);
});

// app.get('/aws-sdk/', (req, res) => {
//   const ddb = new AWS.DynamoDB();
//   const ddbPromise = ddb.listTables().promise();
//   console.log(ddb);
//   console.log(ddbPromise);
//   ddbPromise.then(function(data) {
//     res.send(`ListTables result:\n ${JSON.stringify(data)}`);
//   }).catch(function(err) {
//     res.send(`Encountered error while calling ListTables: ${err}`);
//   });
// });

app.get('/http-request/', (req, res) => {
  const endpoint = 'https://amazon.com/';
  https.get(endpoint, (response) => {
    response.on('data', () => {});

    response.on('error', (err) => {
      res.send(`Encountered error while making HTTPS request: ${err}`);
    });

    response.on('end', () => {
      res.send(`Successfully reached ${endpoint}.`);
    });
  });
});

// app.use(XRayExpress.closeSegment());

app.listen(port, () => console.log(`Example app listening on port ${port}!`));