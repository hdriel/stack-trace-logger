const fs = require('fs');

const exampleCode = fs.readFileSync('src/example.ts', 'utf8');
const seqDocker = fs.readFileSync('docker-config.seq.yml', 'utf8');
const readme = fs.readFileSync('README.md', 'utf8');

const newReadme = [{ example: exampleCode }, { seq: seqDocker }].reduce((readme, fileObj) => {
    const key = Object.keys(fileObj)[0];
    const value = fileObj[key];
    return readme.replace(
        new RegExp(`<!-- ${key}:start -->(.*?)<!-- ${key}:end -->`, 's'),
        `<!-- ${key}:start -->\n\\\`\\\`\\\`ts\n${value}\n\\\`\\\`\\\`\n<!-- ${key}:end -->`
    );
}, readme);

fs.writeFileSync('README.md', newReadme);

console.log('README.md updated with content files.');
