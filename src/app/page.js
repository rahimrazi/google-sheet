//src/app/page.js

"use client"
import { useEffect, useState } from 'react';

function App() {
  const [sheetData, setSheetData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/webhook');
        const data = await response.json();
        setSheetData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    // Fetch data immediately and then every 5 seconds
    fetchData();
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
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