const fs = require('fs');
const path = require('path')

const { streamProcessing } = require('./lib/streamProcessing')
const { asyncForEach } = require('./lib/asyncForEach')

const main = async () => {
    const fromTimestampMs = /^[0-9]{13}$/.test(process.argv[2]) ? process.argv[2] : null;
    const toTimestampMs = /^[0-9]{13}$/.test(process.argv[3]) ? process.argv[3] : null;

    const filesToProcess = fs.readdirSync(path.join(process.cwd(), './input')).filter(file => file.endsWith('.json'));
    console.log('\x1b[36m', `\n\n< --- FILES TO PROCESS = ${filesToProcess.length} --- >`, '\x1b[0m')
    filesToProcess.forEach((file, index) => console.log('-', index, file))

    let results = [];
    let errors = [];
    if (filesToProcess.length) { console.log('\x1b[36m', '\n\n< --- PROCESSING --- >', '\x1b[0m') }
    await asyncForEach(filesToProcess, async file => {
        try {
            const result = await streamProcessing(
                path.join(process.cwd(), `input/${file}`),
                path.join(process.cwd(), `output/${file}`),
                fromTimestampMs,
                toTimestampMs
            );
            results.push({
                'Input file': `${result.inputFileName} (${result.inputFileSizeInMegabytes} Mb)`,
                'Output file': `${result.outputFileName} (${result.outputFileSizeInMegabytes} Mb)`,
                'Google Takeout locations': result.googleTakeoutLocationCount,
                'GeoJson locations': result.geoJsonLocationCount,
                'Processing time': `${result.processingTimeInSecs} Secs`,
            })

        } catch (error) {
            errors.push({
                'Input file': `${file}`,
                'Output file': `${file}`,
                'Error message': error.message,
            });

        }
    })

    if (results.length) { console.log('\x1b[36m', '\n\n< --- RESULTS --- >', '\x1b[0m'); console.table(results) }
    if (errors.length) { console.log('\x1b[36m', '\n\n< --- ERRORS --- >', '\x1b[0m'); console.table(errors) }


};

main();

