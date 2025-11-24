import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTrades, useDailyPnL } from "@/hooks/useTrades";
import { useAuth } from "@/hooks/useAuth";
import { syncTrades } from "@/lib/api";
import { format } from "date-fns";
import {
  Download,
  FileText,
  FileSpreadsheet,
  Loader2,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import { useRef } from "react";
import { ExportReport } from "@/components/dashboard/ExportReport";

export const AccountPage = () => {
  const { id } = useParams();
  const accountId = id ? Number(id) : undefined;

  const { user } = useAuth();
  const { data: trades, isLoading: tradesLoading } = useTrades(accountId);

  const today = new Date();
  const { data: dailyPnL, isLoading: pnlLoading } = useDailyPnL(
    today.getMonth(),
    today.getFullYear(),
    accountId
  );

  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // --- Sync trades handler ---
  const handleSync = async () => {
    if (!accountId) return;
    setSyncing(true);
    setMessage(null);
    try {
      const res = await syncTrades(accountId);
      setMessage(res.message || "Trades synced successfully!");
    } catch (err: any) {
    } finally {
      setSyncing(false);
    }
  };

  // --- Export Handlers ---
  const reportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const handleExportFullCSV = () => {
    if (!trades || trades.length === 0) return;

    const headers = [
      "Ticket",
      "Symbol",
      "Type",
      "Open Time",
      "Open Price",
      "Close Time",
      "Close Price",
      "Volume",
      "Profit",
      "Commission",
      "Swap",
      "Reason",
    ];

    const rows = trades.map((t) => [
      t.ticket,
      t.symbol,
      t.type === 0 ? "Buy" : t.type === 1 ? "Sell" : t.type,
      t.open_time,
      t.open_price,
      t.close_time,
      t.close_price,
      t.volume,
      t.profit,
      t.commission,
      t.swap,
      (t as any).close_reason,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `full_history_${accountId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportFullPDF = async () => {
    if (!reportRef.current || !trades) return;
    setExporting(true);

    try {
      // 1. Capture the charts/widgets
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // High res
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png");

      // 2. Create PDF
      const doc = new jsPDF("p", "mm", "a4");
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = doc.internal.pageSize.getHeight();
      
      // Calculate image height to fit width
      const imgProps = doc.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      doc.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);

      // 3. Add Trade List Table on new page (or below if space)
      let startY = imgHeight + 10;
      if (startY > pdfHeight - 20) {
        doc.addPage();
        startY = 20;
      } else {
        doc.text("Detailed Trade List", 14, startY);
        startY += 10;
      }

      const tableData = trades.map((t) => [
        t.ticket,
        t.symbol,
        t.type === 0 ? "Buy" : "Sell",
        format(new Date(t.close_time), "yyyy-MM-dd HH:mm"),
        t.volume,
        t.profit.toFixed(2),
      ]);

      autoTable(doc, {
        startY: startY,
        head: [["Ticket", "Symbol", "Type", "Close Time", "Vol", "Profit"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [50, 50, 50] },
        styles: { fontSize: 10 },
      });

      doc.save(`full_report_${accountId}.pdf`);
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setExporting(false);
    }
  };

  // --- Performance metrics ---
  const totalProfit = trades?.reduce((sum, t) => sum + t.profit, 0) ?? 0;
  const winRate =
    trades && trades.length > 0
      ? (trades.filter((t) => t.profit > 0).length / trades.length) * 100
      : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header with Sync Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Account #{id}</h1>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" disabled={exporting}>
                {exporting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Export History
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-2">
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start gap-2"
                  onClick={handleExportFullPDF}
                >
                  <FileText className="h-4 w-4" />
                  PDF Report
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start gap-2"
                  onClick={handleExportFullCSV}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  CSV Data
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Button onClick={handleSync} disabled={syncing}>
            {syncing ? "Syncing..." : "Sync Trades"}
          </Button>
        </div>
      </div>
      {message && <p className="text-sm mt-1">{message}</p>}

      {/* Calendar */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-2">Calendar</h2>
        {pnlLoading ? (
          <p>Loading...</p>
        ) : dailyPnL ? (
          <ul className="grid grid-cols-4 gap-2">
            {dailyPnL.stats.map((s) => (
              <li
                key={s.date}
                className={`p-2 rounded ${
                  s.pnl >= 0 ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <div className="text-sm">{format(new Date(s.date), "MMM d")}</div>
                <div className="text-xs">
                  {s.pnl.toFixed(2)} ({s.trades} trades)
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No data</p>
        )}
      </Card>

      {/* Performance */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-2">Performance Metrics</h2>
        {tradesLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-2">
            <p>💰 Total Profit: {totalProfit.toFixed(2)}</p>
            <p>✅ Win Rate: {winRate.toFixed(1)}%</p>
            <p>📊 Total Trades: {trades?.length ?? 0}</p>
          </div>
        )}
      </Card>

      {/* Trade History */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-2">Trade History</h2>
        {tradesLoading ? (
          <p>Loading...</p>
        ) : trades && trades.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Symbol</th>
                <th className="text-left p-2">Type</th>
                <th className="text-left p-2">Volume</th>
                <th className="text-left p-2">Profit</th>
                <th className="text-left p-2">Close Time</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t) => (
                <tr key={t.ticket} className="border-b">
                  <td className="p-2">{t.symbol}</td>
                  <td className="p-2">{t.type === 0 ? "Buy" : "Sell"}</td>
                  <td className="p-2">{t.volume}</td>
                  <td
                    className={`p-2 ${
                      t.profit >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {t.profit.toFixed(2)}
                  </td>
                  <td className="p-2">
                    {format(new Date(t.close_time), "MMM d, HH:mm")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No trades yet.</p>
        )}
      </Card>
      {/* Hidden Report Container for PDF Generation */}
      <ExportReport ref={reportRef} accountId={accountId} />
    </div>
  );
};
