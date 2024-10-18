//src/app/api/webhook/route.js
import { NextResponse } from 'next/server';

let clients = new Set();

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("Webhook received:", body);

    // Send the data to all connected clients
    clients.forEach(client => client.write(`data: ${JSON.stringify(body)}\n\n`));

    return NextResponse.json({ message: "Webhook received" }, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ message: "Error processing webhook" }, { status: 500 });
  }
}

export async function GET() {
  const encoder = new TextEncoder();

  // Create a new readable stream for the client
  const stream = new ReadableStream({
    start(controller) {
      const newClient = {
        id: Date.now(),
        write(data) {
          controller.enqueue(encoder.encode(data));
        },
      };

      // Add the new client to the set of clients
      clients.add(newClient);
      console.log(`Client connected. Total clients: ${clients.size}`);

      // Cleanup on client disconnect
      const cleanup = () => {
        clients.delete(newClient);
        console.log(`Client disconnected. Total clients: ${clients.size}`);
        controller.close(); // Close the stream if necessary
      };

      // Listen for the stream cancellation to clean up the client
      this.cancel = cleanup;
    },
    cancel() {
      // Clear all clients when the stream is canceled
      clients.clear();
      console.log("Stream cancelled. All clients disconnected.");
    },
  });

  // Return the response with SSE headers
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*', // Allow CORS if necessary
    },
  });
}
