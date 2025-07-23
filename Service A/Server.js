const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const Send = require('./kafka/kafkaProducer');
const outboxServices  = require('./services/outboxServices');
const sequelize = require('./db/config');

const packageDef = protoLoader.loadSync('./Summation.proto');
const grpcObject = grpc.loadPackageDefinition(packageDef);
const summationPackage = grpcObject.summationPackage;

async function startServer() {
    const server = new grpc.Server();
    server.bindAsync("0.0.0.0:4000", grpc.ServerCredentials.createInsecure(), (err, port) => {
        if (err) {
            console.error(err);
            return;
        }
        server.start();
        console.log(`Grpc Server Is Running at 0.0.0.0:${port}`);
    });

    server.addService(summationPackage.Summation.service,
        {
            "sumTwoNumbers": sumTwoNumbers
        }
    )

    async function sumTwoNumbers(call, callback) {
        try {
            const A = call.request.a;
            const B = call.request.b;
            const sum = A + B;
            const transaction = await sequelize.transaction();
            try {
                await outboxServices.addOutboxEvent({ payload: { sum } }, transaction);

                await transaction.commit();

                callback(null, { "sum": sum });
            } catch (err) {
                await transaction.rollback(); // Roll back if anything failed
                console.error('Failed to write outbox event:', err);
                callback(err);
            }
            // await Send(sum);
            //implement db transaction adds event to the db instead send data in queue
            //payload is the sum value 
            
        } catch (err) {
            console.error('kafka error:', err);
        }
    }
}

module.exports = startServer;