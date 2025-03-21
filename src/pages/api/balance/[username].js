
export async function GET({ params }) {
  const { username } = params;
  
  try {
    const response = await fetch(`https://mukapay-api.fly.dev/api/users/${username}/balance`, {
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
    return new Response(JSON.stringify({ error: 'Failed to fetch balance' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
} 