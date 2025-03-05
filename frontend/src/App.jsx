import { useEffect, useState } from "react";
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import "./App.css";
import Header from "./components/header/Header";
import InfoBox from "./components/infobox/InfoBox";
import UserForm from "./components/userform/UserForm";
import HistoryPopUp from "./components/historypopup/HistoryPopUp";
import useSSE from "./hooks/useSSE";
import useLocalStorageState from "./hooks/useLocalStorageState";

const apiUrl = import.meta.env.VITE_API_URL;

function App() {
  const [status, setStatus] = useState("");
  const [showInfoBox, setShowInfoBox] = useState(true);
  const [linkHistory, setLinkHistory] = useLocalStorageState("linkHistory", []);
  const { data: statusUpdate } = useSSE(`${apiUrl}/status-updates`);

  useEffect(() => {
    if (statusUpdate) {
      console.log(`Status update: ${statusUpdate}`);
      setStatus(statusUpdate);
    }
  }, [statusUpdate]);

  const processTest = async (address, links) => {
    setStatus("");
    setLinkHistory([...linkHistory, ...links]);
    console.log(`Link history: ${linkHistory}`);
    try {
      const response = await fetch(`${apiUrl}/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ kindleEmail: address, fanficLinks: links }),
      });

      const data = await response.json();
      console.log(data.message);
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
        <UserForm onSubmit={processTest} />
        <p>{status ? status : ""}</p>

        <p>
          Remember, it might take up to a few minutes to process all the files
          and a moment for the files to appear on your Kindle! Happy reading!
          ʕ•ᴥ•ʔ
        </p>
        <HistoryPopUp
          linkHistory={linkHistory}
          clearHistory={() => setLinkHistory([])}
        />
      </div>
    </>
  );
}

export default App;
