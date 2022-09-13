import pkg = require('../package.json');

// const { version } = require('./version.json');

export const handler = async () => ({
  statusCode: 200,
  headers: {
    'Content-Type': 'application/json',
  },
  isBase64Encoded: false,
  body: JSON.stringify({ version: pkg.version }),
});

// exports.handler = async () => {
//   return {
//     statusCode: 200,
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     isBase64Encoded: false,
//     body: JSON.stringify({ version }),
//   };
// };
