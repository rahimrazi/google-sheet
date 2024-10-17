let clients = [];

// Handle POST requests from Google Apps Script (Webhook)
export async function POST(request) {
  const body = await request.json();

  // Send the data to all connected SSE clients
  clients.forEach(client => client.write(`data: ${JSON.stringify(body)}\n\n`));

  return new Response(JSON.stringify({ message: 'Webhook received' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

// SSE endpoint for clients to subscribe to
export function GET() {
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const stream = new ReadableStream({
    start(controller) {
      const client = {
        write(data) {
          controller.enqueue(new TextEncoder().encode(data));
        },
      };

      clients.push(client);

      // Remove client when the connection closes
      controller.signal.addEventListener('abort', () => {
        clients = clients.filter(c => c !== client);
        controller.close();
      });
    },
  });

  return new Response(stream, { headers });
}
