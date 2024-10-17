'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [sheetData, setSheetData] = useState([]);

  useEffect(() => {
    // Open SSE connection to the Next.js API route
    const eventSource = new EventSource('/api/webhook');

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received update from Google Sheets:', data);

      // Update the sheet data with real-time updates
      setSheetData((prevData) => [...prevData, ...data.values]);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div>
      <h1>Google Sheet Data</h1>
      <table border="1">
        <tbody>
          {sheetData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
