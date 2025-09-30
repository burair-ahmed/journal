import { useState } from "react";
import { syncTrades, getStatus } from "../lib/api";

export default function TradesSync() {
  const [status, setStatus] = useState<string>("");
  const [result, setResult] = useState<string>("");

  const handleStatus = async () => {
    const data = await getStatus();
    if (data.status) setStatus(data.status);
  };

  const handleSync = async () => {
    const data = await syncTrades();
    if (data.message) setResult(data.message);
  };

  return (
    <div className="p-4 space-y-2">
      <button
        onClick={handleStatus}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Check API Status
      </button>
      <p>Status: {status}</p>

      <button
        onClick={handleSync}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        Sync Trades
      </button>
      <p>Result: {result}</p>
    </div>
  );
}
