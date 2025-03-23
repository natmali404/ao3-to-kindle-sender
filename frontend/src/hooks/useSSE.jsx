import { useEffect, useState } from "react";

function useSSE(url) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const eventSource = new EventSource(url);

    eventSource.onopen = () => {
      // console.log("SSE connection opened");
    };

    eventSource.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      // console.log("SSE message received:", newData);
      setData(newData.message);
    };

    eventSource.onerror = () => {
      setData("Error - connection lost!");
      eventSource.close();
    };

    return () => eventSource.close();
  }, [url]);

  return { data };
}

export default useSSE;
