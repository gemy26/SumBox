const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const packageDef = protoLoader.loadSync(path.join(__dirname, '../protos/Summation.proto'));

const grpcObject = grpc.loadPackageDefinition(packageDef);
const summationPackage = grpcObject.summationPackage;

const client = new summationPackage.Summation('localhost:4000', grpc.credentials.createInsecure());

const a = parseInt(process.argv[2], 10);
const b = parseInt(process.argv[3], 10);
client.sumTwoNumbers({
        "a" : a,
        "b" : b
    },
    (err, response) => {
        console.log(JSON.stringify(response));
    })

