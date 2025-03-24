import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Analytics } from "@vercel/analytics/react";
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
  const [userId, setUserId] = useState(uuidv4());
  const { data: statusUpdate } = useSSE(`${apiUrl}/status-updates/${userId}`);

  useEffect(() => {
    if (statusUpdate) {
      // console.log(`Status update: ${statusUpdate.message}`);
      setStatus(statusUpdate);
    }
  }, [statusUpdate]);

  const processLinks = async (address, links) => {
    setStatus("");
    setLinkHistory([...linkHistory, ...links]);
    // console.log(`Link history: ${linkHistory}`);
    try {
      const response = await fetch(`${apiUrl}/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kindleEmail: address,
          fanficLinks: links,
          userId: userId,
        }),
      });

      const data = await response.json();
      // console.log(data.message);
      if (data.failedLinks && data.failedLinks.length > 0) {
        setStatus(
          `${data.message} Failed links: ${data.failedLinks.join(", ")}`
        );
      } else {
        setStatus(data.message);
      }
    } catch (error) {
      // console.log(error);
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <>
      <Analytics />
      <Header />
      {/* conditional rendering*/}
      {showInfoBox && <InfoBox onClose={() => setShowInfoBox(false)} />}
      <div className="card">
        <UserForm onSubmit={processLinks} />
        <p>{status ? status : ""}</p>

        <p>
          Remember, it might take up to a few minutes to process all the files
          and a moment for the files to appear on your Kindle!
        </p>
        <p>
          Sometimes, AO3 cannot handle many requests. In case of a failure, just
          try again!
        </p>
        <p>Happy reading! ʕ•ᴥ•ʔ</p>
        <HistoryPopUp
          linkHistory={linkHistory}
          clearHistory={() => setLinkHistory([])}
        />
      </div>
    </>
  );
}

export default App;
