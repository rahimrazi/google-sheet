//src/app/page.js


"use client"
import { useEffect, useState } from 'react';

function App() {
  const [sheetData, setSheetData] = useState({});

  useEffect(() => {
    const eventSource = new EventSource('/api/webhook');

    eventSource.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);
      
      if (type === 'initial') {
        setSheetData(data);
      } else if (type === 'update') {
        setSheetData(prevData => ({
          ...prevData,
          [data.sheetName]: {
            ...(prevData[data.sheetName] || {}),
            [data.row]: {
              ...(prevData[data.sheetName]?.[data.row] || {}),
              [data.col]: data.value
            }
          }
        }));
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div>
      <h1>Google Sheet Data</h1>
      {Object.entries(sheetData).map(([sheetName, sheetContent]) => (
        <div key={sheetName}>
          <h2>{sheetName}</h2>
          <table border="1">
            <tbody>
              {Object.entries(sheetContent).map(([row, rowContent]) => (
                <tr key={row}>
                  {Object.entries(rowContent).map(([col, value]) => (
                    <td key={`${row}-${col}`}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default App;