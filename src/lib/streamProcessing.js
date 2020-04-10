const fs = require('fs')
const path = require('path')

const { pipeline, Transform } = require('stream')
const { streamArray } = require('stream-json/streamers/StreamArray');
const { parser } = require('stream-json/Parser');
const { pick } = require('stream-json/filters/Pick');


const toGeoJsonString = googleTakeoutLocation => {
    return {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [
                googleTakeoutLocation.longitudeE7 / 10000000,
                googleTakeoutLocation.latitudeE7 / 10000000,
            ]
        },
        properties: {
            timestamp: new Date(Number(googleTakeoutLocation.timestampMs)),
            accuracy: googleTakeoutLocation.accuracy || null,
            velocity: googleTakeoutLocation.velocity || null,
            altitude: googleTakeoutLocation.altitude || null
        }
    };
}


const streamProcessing = (inputFilePath, outputFilePath, fromTimestampMs = null, toTimestampMs = null) => new Promise((resolve, reject) => {
    const startTimestamp = new Date();
    console.log(`* -----\n*  Processing ${path.basename(inputFilePath)} started`)

    /**
     * Read Stream
     * 
     * Input file to Stream
     */
    const fileToStream = fs.createReadStream(inputFilePath);


    /**
     * Transform Stream - Parse
     *  
     * It is a Transform stream, which consumes text, and produces 
     * a stream of data items corresponding to high-level tokens
     */
    const streamParser = parser();


    /**
     * Transform Stream - Pick
     *  
     * Is a token item filter, it selects objects from a stream 
     * ignoring the rest and produces a stream of objects (locations in our case)
     */
    const streamPicker = pick({ filter: 'locations' });


    /**
     * Transform Stream - ToArray
     *  
     * It assumes that an input token stream represents an array of objects 
     * and streams out assembled JavaScript objects (locations in our case)
     */
    const streamArrayer = streamArray();


    /**
     * Transform Stream - ToGeoJson
     *  
     * It transforms google takeout locations into GeoJson locations
     */
    let googleTakeoutLocationCount = 0;
    let geoJsonLocationCount = 0;
    const streamGeoJsoner = new Transform({
        objectMode: true,
        transform({ key, value }, _, done) {
            process.stdout.write(`*  Processing location number: ${key + 1}\r`);
            if (fromTimestampMs && toTimestampMs && value.timestampMs >= fromTimestampMs && value.timestampMs <= toTimestampMs) {
                const googleTakeoutLocation = toGeoJsonString(value);
                googleTakeoutLocationCount++;
                done(null, { key: geoJsonLocationCount++, value: googleTakeoutLocation })
            }
            else if (fromTimestampMs && !toTimestampMs && value.timestampMs >= fromTimestampMs) {
                const googleTakeoutLocation = toGeoJsonString(value);
                googleTakeoutLocationCount++;
                done(null, { key: geoJsonLocationCount++, value: googleTakeoutLocation })
            }
            else if (!fromTimestampMs && toTimestampMs && value.timestampMs <= toTimestampMs) {
                const googleTakeoutLocation = toGeoJsonString(value);
                googleTakeoutLocationCount++;
                done(null, { key: geoJsonLocationCount++, value: googleTakeoutLocation })
            }
            else if (!fromTimestampMs && !toTimestampMs) {
                const googleTakeoutLocation = toGeoJsonString(value);
                googleTakeoutLocationCount++;
                done(null, { key: geoJsonLocationCount++, value: googleTakeoutLocation })
            }
            else {
                googleTakeoutLocationCount++;
                done(null);
            }
        }
    });


    /**
     * Transform Stream - ToString
     *  
     * It stringifies GeoJson locations
     */
    const streamStringer = new Transform({
        objectMode: true,
        transform({ key, value }, _, done) {
            if (key === 0) {
                const googleTakeoutLocationString = `${JSON.stringify(value)}`;
                done(null, googleTakeoutLocationString)
            }
            else {
                const googleTakeoutLocationString = `,${JSON.stringify(value)}`;
                done(null, googleTakeoutLocationString)
            }
        }
    });


    /**
     * Write Stream
     *  
     * Stream to Output file
     */
    var streamToFile = fs.createWriteStream(outputFilePath);


    /**
     * 1 - Writes GeoJson file prefix
     * 2 - Piping Streams - Writes GeoJson file locations array
     * 3 - Writes GeoJson file suffix
     */

    // 1 - Writes GeoJson file prefix
    streamToFile.on('open', fd => {
        fs.writeSync(fd, `{"type":"FeatureCollection","features": [`);
    });

    // 2 - Writes GeoJson file locations array
    pipeline(
        fileToStream,
        streamParser,
        streamPicker,
        streamArrayer,
        streamGeoJsoner,
        streamStringer,
        streamToFile,
        (error) => {
            if (error) {
                fs.unlinkSync(outputFilePath);
                console.error('\n*', '\x1b[31m', `Processing ${path.basename(inputFilePath)} failed -->`, error.message, '\x1b[0m', '\n* -----');
                reject(error);
            }
            else {
                console.log('\n*', '\x1b[32m', `Processing ${path.basename(inputFilePath)} completed`, '\x1b[0m', '\n* -----')
                const endTimestamp = new Date();
                resolve({
                    inputFileName: path.basename(inputFilePath),
                    outputFileName: path.basename(outputFilePath),
                    inputFileSizeInMegabytes: fs.statSync(inputFilePath).size / 1000000,
                    outputFileSizeInMegabytes: fs.statSync(outputFilePath).size / 1000000,
                    googleTakeoutLocationCount,
                    geoJsonLocationCount,
                    processingTimeInSecs: (endTimestamp.getTime() - startTimestamp.getTime()) / 1000
                });
            }
        }
    );

    // 3 - Writes GeoJson file suffix
    streamToFile.on('close', () => {
        fs.appendFileSync(outputFilePath, `]}`);
    })


});

module.exports = {
    streamProcessing
};