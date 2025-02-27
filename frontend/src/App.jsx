import { useState } from "react";
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import "./App.css";
import Header from "./components/header/Header";
import InfoBox from "./components/infobox/Infobox";
import UserForm from "./components/userform/UserForm";

function App() {
  const [status, setStatus] = useState("");
  const [showInfoBox, setShowInfoBox] = useState(true);

  const processTest = async (address, links) => {
    setStatus("Please wait...");
    try {
      const response = await fetch("http://localhost:8080/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ kindleEmail: address, fanficLinks: links }),
      });

      const data = await response.json();
      setStatus(data.message);
    } catch (error) {
      console.log(error);
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <>
      <Header />
      {/* conditional rendering*/}
      {showInfoBox && <InfoBox onClose={() => setShowInfoBox(false)} />}
      <div className="card">
        <UserForm onButtonClick={processTest} />
        <p>{status}</p>
        <p>
          Remember, it might take up to a few minutes to process all the files
          and a moment for the files to appear on your Kindle! Happy reading!
          ʕ•ᴥ•ʔ
        </p>
      </div>
    </>
  );
}

export default App;
