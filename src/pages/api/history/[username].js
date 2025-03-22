export const prerender = false;

export async function GET({ params }) {
    const { username } = params;
    console.log('username:', username);
    
    try {
      const response = await fetch(`https://mukapay-api.fly.dev/api/users/${username}/history`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      const data = await response.json();
      
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to fetch history' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
}