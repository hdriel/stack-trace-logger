const fs = require('fs');

const exampleCode = fs.readFileSync('src/example.ts', { encoding: 'utf8' });
const seqDocker = fs.readFileSync('docker-compose.seq.yml', { encoding: 'utf8' });
const readme = fs.readFileSync('README.template.md', { encoding: 'utf8' });

const newReadme = [{ example: exampleCode }, { seq: seqDocker }].reduce((readme, fileObj) => {
    const key = Object.keys(fileObj)[0];
    const lang = key === 'seq' ? 'yaml' : 'ts';
    const value = `<!-- ${key}:start -->\n\\\`\\\`\\\`${lang}\n${fileObj[key]}\n\\\`\\\`\\\`\n<!-- ${key}:end -->`;
    const pattern = new RegExp(`<!-- ${key}:start -->(.*?)<!-- ${key}:end -->`, 's');

    return readme.replace(pattern, value);
}, readme);

fs.writeFileSync('README.md', newReadme, { encoding: 'utf8' });

console.log('✅ README.md updated with embedded content.');
