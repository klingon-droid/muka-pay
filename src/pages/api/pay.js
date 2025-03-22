export const prerender = false;

export async function POST({ request }) {
  const { payment_proof, amount, from_hash, to_hash } = await request.json();
//   console.log('paymentData:', payment_proof, amount, from_hash, to_hash)
  const payload = {payment_proof, amount, from_hash, to_hash}
  console.log('payload-', payload)
  
  try {
    const response = await fetch(`https://mukapay-api.fly.dev/api/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const error = await response.text();
      console.error('Payment API error:', error);
      throw new Error(`Payment failed with status ${response.status}: ${error}`);
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
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to pay' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
} 