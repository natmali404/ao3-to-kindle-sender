import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [status, setStatus] = useState("");

  const executeTest = async () => {
    try {
      const response = await fetch("http://localhost:8080/execute", {
        method: "POST"
      });

      if(!response.ok) {
        throw new Error("Failed")
      }

      const data = await response.json();
      setStatus(data.message);
    } catch(error) {
      console.log(error);
      setStatus(`Error: ${error.message}`);
    }
  }

  return (
    <>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <button onClick={executeTest}>
          Execute
        </button>
        <p>{status}</p>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
    </>
  )
}

export default App
