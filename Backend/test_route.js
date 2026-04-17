const http = require('http');

// Test if the route is registered
const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/ai/highlights/000000000000000000000000',
    method: 'GET',
    headers: {
        'Authorization': 'Bearer invalid_token'
    }
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', data);
    });
});

req.on('error', (e) => console.error('Connection error:', e.message));
req.end();
