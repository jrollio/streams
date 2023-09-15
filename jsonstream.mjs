// import db from './db.json';
import * as fs from 'node:fs';
// import db from './db.json' assert { type: 'json' };

class ObjectBuilder {
    constructor() {
        this.finalObject = undefined;
        this.parentStack = [];

        this.currentKey = undefined;
    }

    hasFinished() {
        return this.finalObject !== undefined;
    }

    getFinalObject() {
        return this.finalObject;
    }

    currentObject() {
        return this.parentStack[this.parentStack.length - 1];
    }

    addValue(val) {
        if (Array.isArray(this.currentObject())) {
            this.currentObject().push(val);
        }
        else {
            this.currentObject()[this.currentKey] = val;
            this.currentKey = undefined;
        }
    }

    processData(data) {
        switch (data.name) {
            case `startKey`:
            case `endKey`:
            case `startString`:
            case `endString`:
            case `stringChunk`:
                // ignore, always followed by [something]Value
                break;

            case `keyValue`:
                this.currentObject()[data.value] = undefined;
                this.currentKey = data.value;
                break;
            case `numberValue`:
                this.addValue(Number(data.value))
                break
            case `stringValue`:
                this.addValue(data.value);
                break;

            case `startObject`:
                let newObject = {};
                if (this.parentStack.length === 0) {
                    // do nothing else, initialises first parent
                }
                else if (Array.isArray(this.currentObject())) {
                    this.currentObject().push(newObject);
                }
                else {
                    this.currentObject()[this.currentKey] = newObject;
                }
                this.parentStack.push(newObject);
                this.currentKey = undefined;
                break;

            case `endObject`:
                let parent = this.parentStack.pop();
                if (this.parentStack.length === 0) {
                    this.finalObject = parent;
                }
                break;

            case `startArray`:
                let newArray = [];
                if (Array.isArray(this.currentObject())) {
                    this.currentObject().push(newArray);
                }
                else {
                    this.currentObject()[this.currentKey] = newArray;
                }
                this.parentStack.push(newArray);
                this.currentKey = undefined;

                break;
            case `endArray`:
                this.parentStack.pop();
                this.currentKey = undefined;
                break;
        }
    }
}

function runSample(streamData) {

    let currentlyProcessing = undefined;
    function buildItem(data) {
        console.log('buildItem:143:data',JSON.parse(data).products[0])
        if (currentlyProcessing === undefined && data.name === "endArray") {
            console.log('stream ended')
            return; // stream ended
        }

        if (currentlyProcessing === undefined) {
            currentlyProcessing = new ObjectBuilder();
        }
        currentlyProcessing.processData(data);

        if (currentlyProcessing.hasFinished()) {
            // Finished building project; do something with it
            let niceOutput = JSON.stringify(currentlyProcessing.getFinalObject(), null, 4);
            console.log(niceOutput);
            currentlyProcessing = undefined;
        }
    }

    // const readStream = fs.createReadStream('./db.json', { encoding: "utf-8" })
    // const readStream = fs.createReadStream('./db.json')
    // .on('data',data=>streamData.push(data))//console.log(data))
    // .on('data',data=>runSample(data))//console.log(data))
    
    // runSample(streamData);
    // .on('data',data=>buildItem(data))//console.log(data))
    // const readStream = fs.createReadStream('./db.json')
    streamData.on('data',data=>buildItem(data))//console.log(data))

    .on('end',()=>{console.log('end of stream')});

    // simulate reading stream
    /*
    for (let i = 0; i < streamData.length; ++i) {
        if (i === 0) {
            // Skip first chunk as it starts the array of items
            continue;
        }
        buildItem(streamData[i]);
        
    }
    */
    // fetch(db)
    // const readStream = fs.createReadStream(db)
}
function main(){

    const readStream = fs.createReadStream('./db.json', { encoding: "utf-8" })
    // .on('data',data=>streamData.push(data))//console.log(data))
    .on('data',data=>runSample(data))//console.log(data))
    // runSample(streamData);

    .on('end',()=>{console.log('end of stream')});
/*
        .then(response=>response.body)
        .then(rs=>{
            let reader = rs.getReader();

            return new ReadableStream({
                async start(controller){
                    while(true){
                        let { done, value } = await reader.read();

                        if(done) break;
                        buildItem(value);
                        // controller.enqueue(value);
                    }
                    controller.close();
                    reader.releaseLock();
                }
            })
        })
        .then(rs=>new Response(rs))
}

const streamData = [
    {"name": "startArray"}
    ,{"name": "startObject"}
    ,{"name": "startKey"}
    ,{"name": "stringChunk","value": "type"}
    ,{"name": "endKey"}
    ,{"name": "keyValue","value": "type"}
    ,{"name": "startString"}
    ,{"name": "stringChunk","value": "item"}
    ,{"name": "endString"}
    ,{"name": "stringValue","value": "item"}
    ,{"name": "startKey"}
    ,{"name": "stringChunk","value": "id"}
    ,{"name": "endKey"}
    ,{"name": "keyValue","value": "id"}
    ,{"name": "startString"}
    ,{"name": "stringChunk","value": "Q31"}
    ,{"name": "endString"}
    ,{"name": "stringValue","value": "Q31"}
    ,{"name": "startKey"}
    ,{"name": "stringChunk","value": "labels"}
    ,{"name": "endKey"}
    ,{"name": "keyValue","value": "labels"}
    ,{"name": "startObject"}
    ,{"name": "startKey"}
    ,{"name": "stringChunk","value": "el"}
    ,{"name": "endKey"}
    ,{"name": "keyValue","value": "el"}
    ,{"name": "startObject"}
    ,{"name": "startKey"}
    ,{"name": "stringChunk","value": "language"}
    ,{"name": "endKey"}
    ,{"name": "keyValue","value": "language"}
    ,{"name": "startString"}
    ,{"name": "stringChunk","value": "el"}
    ,{"name": "endString"}
    ,{"name": "stringValue","value": "el"}
    ,{"name": "startKey"}
    ,{"name": "stringChunk","value": "value"}
    ,{"name": "endKey"}
    ,{"name": "keyValue","value": "value"}
    ,{"name": "startString"}
    ,{"name": "stringChunk","value": "Β"}
    ,{"name": "stringChunk","value": "έ"}
    ,{"name": "stringChunk","value": "λ"}
    ,{"name": "stringChunk","value": "γ"}
    ,{"name": "stringChunk","value": "ι"}
    ,{"name": "stringChunk","value": "ο"}
    ,{"name": "endString"}
    ,{"name": "stringValue","value": "Βέλγιο"}
    ,{"name": "endObject"}
    ,{"name": "startKey"}
    ,{"name": "stringChunk","value": "ay"}
    ,{"name": "endKey"}
    ,{"name": "keyValue","value": "ay"}
    ,{"name": "startObject"}
    ,{"name": "startKey"}
    ,{"name": "stringChunk","value": "language"}
    ,{"name": "endKey"}
    ,{"name": "keyValue","value": "language"}
    ,{"name": "startString"}
    ,{"name": "stringChunk","value": "ay"}
    ,{"name": "endString"}
    ,{"name": "stringValue","value": "ay"}
    ,{"name": "startKey"}
    ,{"name": "stringChunk","value": "value"}
    ,{"name": "endKey"}
    ,{"name": "keyValue","value": "value"}
    ,{"name": "startString"}
    ,{"name": "stringChunk","value": "Bilkiya"}
    ,{"name": "endString"}
    ,{"name": "stringValue","value": "Bilkiya"}
    ,{"name": "endObject"}
    ,{"name": "startKey"}
    ,{"name": "stringChunk","value": "pnb"}
    ,{"name": "endKey"}
    ,{"name": "keyValue","value": "pnb"}
    ,{"name": "startObject"}
    ,{"name": "startKey"}
    ,{"name": "stringChunk","value": "language"}
    ,{"name": "endKey"}
    ,{"name": "keyValue","value": "language"}
    ,{"name": "startString"}
    ,{"name": "stringChunk","value": "pnb"}
    ,{"name": "endString"}
    ,{"name": "stringValue","value": "pnb"}
    ,{"name": "startKey"}
    ,{"name": "stringChunk","value": "value"}
    ,{"name": "endKey"}
    ,{"name": "keyValue","value": "value"}
    ,{"name": "startString"}
    ,{"name": "stringChunk","value": "ب"}
    ,{"name": "stringChunk","value": "ی"}
    ,{"name": "stringChunk","value": "ل"}
    ,{"name": "stringChunk","value": "ج"}
    ,{"name": "stringChunk","value": "ی"}
    ,{"name": "stringChunk","value": "م"}
    ,{"name": "endString"}
    ,{"name": "stringValue","value": "بیلجیم"}
    ,{"name": "endObject"}
    ,{"name": "endObject"}
    ,{"name": "endObject"}
    ,{"name": "startObject"}
    ,{"name": "startKey"}
    ,{"name": "stringChunk","value": "type"}
    ,{"name": "endKey"}
    ,{"name": "keyValue","value": "type"}
    ,{"name": "startString"}
    ,{"name": "stringChunk","value": "item"}
    ,{"name": "endString"}
    ,{"name": "stringValue","value": "item"}
    ,{"name": "startKey"}
    ,{"name": "stringChunk","value": "id"}
    ,{"name": "endKey"}
    ,{"name": "keyValue","value": "id"}
    ,{"name": "startString"}
    ,{"name": "stringChunk","value": "Q31"}
    ,{"name": "endString"}
    ,{"name": "stringValue","value": "Q31"}
    ,{"name": "startKey"}
    ,{"name": "stringChunk","value": "labels"}
    ,{"name": "endKey"}
    ,{"name": "keyValue","value": "labels"}
    ,{"name": "startObject"}
    ,{"name": "startKey"}
    ,{"name": "stringChunk","value": "el"}
    ,{"name": "endKey"}
    ,{"name": "keyValue","value": "el"}
    ,{"name": "startObject"}
    ,{"name": "startKey"}
    ,{"name": "stringChunk","value": "language"}
    ,{"name": "endKey"}
    ,{"name": "keyValue","value": "language"}
    ,{"name": "startString"}
    ,{"name": "stringChunk","value": "el"}
    ,{"name": "endString"}
    ,{"name": "stringValue","value": "el"}
    ,{"name": "startKey"}
    ,{"name": "stringChunk","value": "value"}
    ,{"name": "endKey"}
    ,{"name": "keyValue","value": "value"}
    ,{"name": "startString"}
    ,{"name": "stringChunk","value": "Β"}
    ,{"name": "stringChunk","value": "έ"}
    ,{"name": "stringChunk","value": "λ"}
    ,{"name": "stringChunk","value": "γ"}
    ,{"name": "stringChunk","value": "ι"}
    ,{"name": "stringChunk","value": "ο"}
    ,{"name": "endString"}
    ,{"name": "stringValue","value": "Βέλγιο"}
    ,{"name": "endObject"}
    ,{"name": "startKey"}
    ,{"name": "stringChunk","value": "ay"}
    ,{"name": "endKey"}
    ,{"name": "keyValue","value": "ay"}
    ,{"name": "startObject"}
    ,{"name": "startKey"}
    ,{"name": "stringChunk","value": "language"}
    ,{"name": "endKey"}
    ,{"name": "keyValue","value": "language"}
    ,{"name": "startString"}
    ,{"name": "stringChunk","value": "ay"}
    ,{"name": "endString"}
    ,{"name": "stringValue","value": "ay"}
    ,{"name": "startKey"}
    ,{"name": "stringChunk","value": "value"}
    ,{"name": "endKey"}
    ,{"name": "keyValue","value": "value"}
    ,{"name": "startString"}
    ,{"name": "stringChunk","value": "Bilkiya"}
    ,{"name": "endString"}
    ,{"name": "stringValue","value": "Bilkiya"}
    ,{"name": "endObject"}
    ,{"name": "startKey"}
    ,{"name": "stringChunk","value": "pnb"}
    ,{"name": "endKey"}
    ,{"name": "keyValue","value": "pnb"}
    ,{"name": "startObject"}
    ,{"name": "startKey"}
    ,{"name": "stringChunk","value": "language"}
    ,{"name": "endKey"}
    ,{"name": "keyValue","value": "language"}
    ,{"name": "startString"}
    ,{"name": "stringChunk","value": "pnb"}
    ,{"name": "endString"}
    ,{"name": "stringValue","value": "pnb"}
    ,{"name": "startKey"}
    ,{"name": "stringChunk","value": "value"}
    ,{"name": "endKey"}
    ,{"name": "keyValue","value": "value"}
    ,{"name": "startString"}
    ,{"name": "stringChunk","value": "ب"}
    ,{"name": "stringChunk","value": "ی"}
    ,{"name": "stringChunk","value": "ل"}
    ,{"name": "stringChunk","value": "ج"}
    ,{"name": "stringChunk","value": "ی"}
    ,{"name": "stringChunk","value": "م"}
    ,{"name": "endString"}
    ,{"name": "stringValue","value": "بیلجیم"}
    ,{"name": "endObject"}
    ,{"name": "startKey"}
    ,{"name": "stringChunk","value": "nestedArray"}
    ,{"name": "endKey"}
    ,{"name": "keyValue","value": "nestedArray"}
    ,{"name": "startArray"}
    ,{"name": "stringValue","value": "a"}
    ,{"name": "stringValue","value": "b"}
    ,{"name": "startArray"}
    ,{"name": "stringValue","value": "c"}
    ,{"name": "startObject"}
    ,{"name": "keyValue","value": "another object"}
    ,{"name": "stringValue","value": "d"}
    ,{"name": "endObject"}
    ,{"name": "stringValue","value": "e"}
    ,{"name": "endArray"}
    ,{"name": "stringValue","value": "b"}
    ,{"name": "endArray"}
    ,{"name": "endObject"}
    ,{"name": "endObject"}
    ,{"name": "endArray"}
];
*/
}
// const streamData = [];

// runSample(streamData);
// main();
// runSample();
runSample(fs.createReadStream('./db.json'));
// fs.createReadStream('./db.json')
