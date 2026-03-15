// netlify/functions/jobs.js
// Serverless proxy for Adzuna API — avoids browser CORS restrictions
// Deployed at: /.netlify/functions/jobs

const ADZUNA_APP_ID  = '126d2f2c';
const ADZUNA_APP_KEY = '544494598ea6c32e4fd7a4bfeb4d1d03';
const ADZUNA_BASE    = 'https://api.adzuna.com/v1/api/jobs/ca/search';

exports.handler = async function (event) {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const params = event.queryStringParameters || {};
    const query     = params.query     || '';
    const where     = params.where     || '';
    const salaryMin = params.salary_min || '';

    if (!query) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing required parameter: query' })
        };
    }

    let url = `${ADZUNA_BASE}/1`
        + `?app_id=${ADZUNA_APP_ID}`
        + `&app_key=${ADZUNA_APP_KEY}`
        + `&results_per_page=20`
        + `&what=${encodeURIComponent(query)}`
        + `&sort_by=salary`
        + `&content-type=application/json`;

    if (where)     url += `&where=${encodeURIComponent(where)}`;
    if (salaryMin) url += `&salary_min=${encodeURIComponent(salaryMin)}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            return {
                statusCode: response.status,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: `Adzuna returned ${response.status}` })
            };
        }

        const data = await response.json();

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=300'
            },
            body: JSON.stringify(data)
        };

    } catch (err) {
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Internal server error', detail: err.message })
        };
    }
};
