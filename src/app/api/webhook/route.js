//src/app/api/webhook/route.js
import { NextResponse } from 'next/server';
import NodeCache from 'node-cache';

// Initialize the cache
const cache = new NodeCache({ stdTTL: 100, checkperiod: 120 });

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("Webhook received:", body);

    // Store the data in cache
    const cacheKey = `${body.sheetName}-${body.row}-${body.col}`;
    cache.set(cacheKey, body);

    return NextResponse.json({ message: "Webhook received" }, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ message: "Error processing webhook" }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Retrieve all cached data
    const allData = cache.mget(cache.keys());
    
    // Transform the data into the structure expected by the client
    const sheetData = Object.values(allData).reduce((acc, item) => {
      if (!acc[item.sheetName]) {
        acc[item.sheetName] = {};
      }
      if (!acc[item.sheetName][item.row]) {
        acc[item.sheetName][item.row] = {};
      }
      acc[item.sheetName][item.row][item.col] = item.value;
      return acc;
    }, {});

    return NextResponse.json(sheetData);
  } catch (error) {
    console.error("Error retrieving cached data:", error);
    return NextResponse.json({ message: "Error retrieving data" }, { status: 500 });
  }
}