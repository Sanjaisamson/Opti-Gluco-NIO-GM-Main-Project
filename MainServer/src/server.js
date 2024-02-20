const http = require('http');

async function testApi(req, res, next){
    try {
        const server = http.createServer((req, res) => {
            if (req.url === '/api/data' && req.method === 'POST') {
              let data = '';
              req.on('data', chunk => {
                data += chunk;
              });
              req.on('end', () => {
                console.log('Received data:', data);
                res.end('Data received successfully');
              });
            } else {
              res.statusCode = 404;
              res.end('Not found');
            }
          });
          
          server.listen(4000, () => {
            console.log('First server is running on http://localhost:4000');
          });
    } catch (error) {
        
    }
}

module.exports = {testApi}