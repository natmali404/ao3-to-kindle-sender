import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import Header from './components/header/Header';
import InfoBox from './components/infobox/Infobox';
import UserForm from './components/userform/UserForm';

function App() {
  const [count, setCount] = useState(0)
  const [status, setStatus] = useState("");
  const [showInfoBox, setShowInfoBox] = useState(true);

  //not much different from async function executeTest, but preferred in React

  const processTest = async (address, links) => {
    try {
      const response = await fetch("http://localhost:8080/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ kindleMail: address, fanficLinks: links }),
      });
    } catch (error) {
      console.log(error);
    }
  }

  const executeTest = async () => {
    setStatus("Please wait...");
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
      <Header />
      {/* conditional rendering wowww robi wrazenie */}
      {showInfoBox && <InfoBox onClose={() => setShowInfoBox(false)} />} 
      <div className="card">
        <UserForm onButtonClick={() => processTest("kindle_mail@kindle.com", ["https://archiveofourown.org/works/12345678", "https://archiveofourown.org/works/87654321"])} />
        <button className='main-button' onClick={executeTest}>
          Execute test send to Kindle
        </button>
        <p>{status}</p>
        {/* <button className='main-button' onClick={() => processTest("kindle_mail@kindle.com", ["https://archiveofourown.org/works/12345678", "https://archiveofourown.org/works/87654321"])}>
          Test request
        </button> */}
        <p>
          Remember, it might take a moment for the files to appear on your Kindle! Happy reading!
        </p>
      </div>
    </>
  )
}

export default App
