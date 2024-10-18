//src/app/api/webhook/route.js
import { NextResponse } from 'next/server';
import NodeCache from 'node-cache';

const cache = new NodeCache();
let clients = new Set();

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("Webhook received:", body);

    // Update the cache with the new data
    let currentData = cache.get('sheetData') || {};
    currentData = {
      ...currentData,
      [body.sheetName]: {
        ...(currentData[body.sheetName] || {}),
        [body.row]: {
          ...(currentData[body.sheetName]?.[body.row] || {}),
          [body.col]: body.value
        }
      }
    };
    cache.set('sheetData', currentData);

    // Send the update to all connected clients
    const update = JSON.stringify({ type: 'update', data: body });
    clients.forEach(client => client.write(`data: ${update}\n\n`));

    return NextResponse.json({ message: "Webhook received" }, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ message: "Error processing webhook" }, { status: 500 });
  }
}

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const newClient = {
        id: Date.now(),
        write(data) {
          controller.enqueue(data);
        },
      };

      clients.add(newClient);

      // Send the current data to the new client
      const currentData = cache.get('sheetData') || {};
      newClient.write(`data: ${JSON.stringify({ type: 'initial', data: currentData })}\n\n`);

      return () => {
        clients.delete(newClient);
      };
    },
    cancel() {
      clients.delete(this);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}