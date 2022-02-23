const axios = require('axios');

exports.handler = async function (event, context) {
    const ip = event.headers['client-ip'];

    if (event.httpMethod === 'GET') {
        try {
            const res = (await axios.get('https://ipapi.co/' + ip + '/json/')).body;

            if (res.timezone) {
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        unixtime: Math.floor(Date.now()),
                        timezone: res.timezone,
                    })
                }
            } else { 
                throw 'Request Errors' 
            }


        } catch (err) {
            return {
                statusCode: 500,
                body: 'Request failed'
            }
        }
    } else {
        return {
            statusCode: 405,
            body: 'Method not supported'
        }
    }
}
