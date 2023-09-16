// import db from './db.json';
import * as fs from 'node:fs';
import * as mongoClient from 'mongodb';
import { MongoClient } from 'mongodb';

// import db from './db.json' assert { type: 'json' };

async function insertDoc(client, doc){
    let result = await client.db('survey').collection('products').insertOne(doc);
    console.log(`New listing created with the following id: ${result.insertedId}`);
}

function main(streamData) {

    let uri = 'mongodb://black.local';
    let client = new MongoClient(uri);

    streamData.on('data',(data)=>{
        JSON.parse(data).products.forEach(async (e)=>{
            await insertDoc(client,e);
        })
    })
    .on('end',()=>{console.log('end of stream')});

}

main(fs.createReadStream('./db.json'));
