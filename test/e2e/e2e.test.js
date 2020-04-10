const fs = require('fs');
const path = require('path')
const expect = require('expect.js');

const { emptyDirectory } = require('../helpers/emptyDirectory')
const { copyFile } = require('../helpers/copyDirectoryContent')
const { asyncExec } = require('../helpers/asyncExec')


const inputDirectory = path.join(process.cwd(), `./input`);
const outputDirectory = path.join(process.cwd(), `./output`);
const mockInputDirectory = path.join(process.cwd(), `./test/e2e/mockInputs`);
const expectedOutputs = path.join(process.cwd(), `./test/e2e/expectedOutputs`);


describe('Tanslator test', () => {
    before('borrar files ', async () => {
        await emptyDirectory(inputDirectory);
        await emptyDirectory(outputDirectory);
    });

    afterEach('borrar files ', async () => {
        await emptyDirectory(inputDirectory);
        await emptyDirectory(outputDirectory);
    });

    it('Should not translate an empty file', async () => {
        const file = 'x_empty.json';
        await copyFile(path.join(mockInputDirectory, file), path.join(inputDirectory, file));
        await asyncExec('node src/index.js');

        const outputFiles = fs.readdirSync(outputDirectory).filter(file => file !== '.gitignore');
        expect(outputFiles).to.eql([]);
    });

    it('Should translate 1 location to 1 location without filters', async () => {
        const file = '1_locations.json';
        await copyFile(path.join(mockInputDirectory, file), path.join(inputDirectory, file));
        await asyncExec('node src/index.js');

        const outputFiles = fs.readdirSync(outputDirectory).filter(file => file !== '.gitignore');
        expect(outputFiles).to.eql([file]);

        const outputFileContent = fs.readFileSync(path.join(outputDirectory, file), 'utf8');
        const expectedOutputFileContent = fs.readFileSync(path.join(expectedOutputs, '1_to_1_locations_no_filters.json'), 'utf8');
        const output = JSON.stringify(JSON.parse(outputFileContent));
        const expected = JSON.stringify(JSON.parse(expectedOutputFileContent));
        expect(output).to.eql(expected);
    });

    it('Should translate 4 locations to 4 locations without filters', async () => {
        const file = 'n_locations.json';
        await copyFile(path.join(mockInputDirectory, file), path.join(inputDirectory, file));
        await asyncExec('node src/index.js');

        const outputFiles = fs.readdirSync(outputDirectory).filter(file => file !== '.gitignore');
        expect(outputFiles).to.eql([file]);

        const outputFileContent = fs.readFileSync(path.join(outputDirectory, file), 'utf8');
        const expectedOutputFileContent = fs.readFileSync(path.join(expectedOutputs, '4_to_4_locations_no_filters.json'), 'utf8');
        const output = JSON.stringify(JSON.parse(outputFileContent));
        const expected = JSON.stringify(JSON.parse(expectedOutputFileContent));
        expect(output).to.eql(expected);
    });

    it('Should translate 4 locations to 1 locations with lower bound filter', async () => {
        const file = 'n_locations.json';
        await copyFile(path.join(mockInputDirectory, file), path.join(inputDirectory, file));
        await asyncExec('node src/index.js 1507330772003 _');

        const outputFiles = fs.readdirSync(outputDirectory).filter(file => file !== '.gitignore');
        expect(outputFiles).to.eql([file]);

        const outputFileContent = fs.readFileSync(path.join(outputDirectory, file), 'utf8');
        const expectedOutputFileContent = fs.readFileSync(path.join(expectedOutputs, '4_to_1_locations_lower_filter.json'), 'utf8');
        const output = JSON.stringify(JSON.parse(outputFileContent));
        const expected = JSON.stringify(JSON.parse(expectedOutputFileContent));
        expect(output).to.eql(expected);
    });

    it('Should translate 4 locations to 1 locations with upper bound filter', async () => {
        const file = 'n_locations.json';
        await copyFile(path.join(mockInputDirectory, file), path.join(inputDirectory, file));
        await asyncExec('node src/index.js _ 1507330772000');

        const outputFiles = fs.readdirSync(outputDirectory).filter(file => file !== '.gitignore');
        expect(outputFiles).to.eql([file]);

        const outputFileContent = fs.readFileSync(path.join(outputDirectory, file), 'utf8');
        const expectedOutputFileContent = fs.readFileSync(path.join(expectedOutputs, '4_to_1_locations_upper_filter.json'), 'utf8');
        const output = JSON.stringify(JSON.parse(outputFileContent));
        const expected = JSON.stringify(JSON.parse(expectedOutputFileContent));
        expect(output).to.eql(expected);
    });

    it('Should translate 4 locations to 2 locations with lower and upper bound filter', async () => {
        const file = 'n_locations.json';
        await copyFile(path.join(mockInputDirectory, file), path.join(inputDirectory, file));
        await asyncExec('node src/index.js 1507330772001 1507330772002');

        const outputFiles = fs.readdirSync(outputDirectory).filter(file => file !== '.gitignore');
        expect(outputFiles).to.eql([file]);

        const outputFileContent = fs.readFileSync(path.join(outputDirectory, file), 'utf8');
        const expectedOutputFileContent = fs.readFileSync(path.join(expectedOutputs, '4_to_2_locations_lower_upper_filter.json'), 'utf8');
        const output = JSON.stringify(JSON.parse(outputFileContent));
        const expected = JSON.stringify(JSON.parse(expectedOutputFileContent));
        expect(output).to.eql(expected);
    });

    it('Should translate 2 files 1 to 1 and 4 to 4 locations without filters', async () => {
        const fileOne = '1_locations.json';
        const fileTwo = 'n_locations.json';
        await copyFile(path.join(mockInputDirectory, fileOne), path.join(inputDirectory, fileOne));
        await copyFile(path.join(mockInputDirectory, fileTwo), path.join(inputDirectory, fileTwo));
        await asyncExec('node src/index.js');

        const outputFiles = fs.readdirSync(outputDirectory).filter(file => file !== '.gitignore');
        expect(outputFiles).to.eql([fileOne, fileTwo]);

        const outputFileOneContent = fs.readFileSync(path.join(outputDirectory, fileOne), 'utf8');
        const expectedOutputFileOneContent = fs.readFileSync(path.join(expectedOutputs, '1_to_1_locations_no_filters.json'), 'utf8');
        const outputOne = JSON.stringify(JSON.parse(outputFileOneContent));
        const expectedOne = JSON.stringify(JSON.parse(expectedOutputFileOneContent));
        expect(outputOne).to.eql(expectedOne);

        const outputFileTwoContent = fs.readFileSync(path.join(outputDirectory, fileTwo), 'utf8');
        const expectedOutputFileTwoContent = fs.readFileSync(path.join(expectedOutputs, '4_to_4_locations_no_filters.json'), 'utf8');
        const outputTwo = JSON.stringify(JSON.parse(outputFileTwoContent));
        const expectedTwo = JSON.stringify(JSON.parse(expectedOutputFileTwoContent));
        expect(outputTwo).to.eql(expectedTwo);
    });
});
