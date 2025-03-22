export const prerender = false;

export async function POST({ request }) {
    const { proof } = await request.json();
    const payload = {proof}
    
    try {

        const url = 'https://mukapay-api.fly.dev/api/register'
        // const url = 'http://localhost:3000/api/register'

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const error = await response.text();
            console.error('Register API error:', error);
            throw new Error(`Register failed with status ${response.status}: ${error}`);
        } else {
            const data = await response.json();
            console.log('data:', data)
            return new Response(JSON.stringify(data), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to register' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}





