module.exports = {
    transforms: {
        CODE(content, options) {
            const fs = require('fs');
            return fs.readFileSync(options.src, 'utf8');
        },
    },
};
