// export async function POST(request) {
//     try {
//       // Parse the request body (the payload from Google Apps Script)
//       const body = await request.json();
  
//       // Log the body to confirm it is being received correctly
//       console.log('Webhook received:', body);
  
//       // Respond with a success message
//       return new Response(JSON.stringify({ message: 'Webhook received' }), {
//         status: 200,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     } catch (error) {
//       console.error('Error processing webhook:', error);
  
//       // Respond with an error message
//       return new Response(JSON.stringify({ message: 'Error processing webhook' }), {
//         status: 500,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }
//   }

// import { NextResponse } from 'next/server';

// let clients = new Set();

// export async function POST(request) {
//   try {
//     const body = await request.json();
//     console.log("Webhook received:", body);
//     clients.forEach(client => client.write(`data: ${JSON.stringify(body)}\n\n`));
//     return NextResponse.json({ message: "Webhook received" }, { status: 200 });
//   } catch (error) {
//     console.error("Error processing webhook:", error);
//     return NextResponse.json({ message: "Error processing webhook" }, { status: 500 });
//   }
// }

// export async function GET() {
//   const encoder = new TextEncoder();

//   const stream = new ReadableStream({
//     start(controller) {
//       const newClient = {
//         id: Date.now(),
//         write(data) {
//           controller.enqueue(encoder.encode(data));
//         }
//       };

//       clients.add(newClient);

//       console.log(`Client connected. Total clients: ${clients.size}`);

//       // Cleanup function
//       return () => {
//         clients.delete(newClient);
//         console.log(`Client disconnected. Total clients: ${clients.size}`);
//       };
//     },
//     cancel() {
//       clients.clear();
//       console.log("Stream cancelled. All clients disconnected.");
//     },
//   });

//   return new Response(stream, {
//     headers: {
//       'Content-Type': 'text/event-stream',
//       'Cache-Control': 'no-cache',
//       'Connection': 'keep-alive',
//     },
//   });
// }

import { NextResponse } from 'next/server';

let clients = new Set();

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("Webhook received:", body);
    clients.forEach(client => client.write(`data: ${JSON.stringify(body)}\n\n`));
    return NextResponse.json({ message: "Webhook received" }, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ message: "Error processing webhook" }, { status: 500 });
  }
}

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const newClient = {
        id: Date.now(),
        write(data) {
          controller.enqueue(encoder.encode(data));
        }
      };

      clients.add(newClient);

      console.log(`Client connected. Total clients: ${clients.size}`);

      return () => {
        clients.delete(newClient);
        console.log(`Client disconnected. Total clients: ${clients.size}`);
      };
    },
    cancel() {
      clients.clear();
      console.log("Stream cancelled. All clients disconnected.");
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
