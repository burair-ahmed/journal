import { useFilteredTrades } from "@/hooks/useTrades";
import { Card } from "@/components/ui/card";
import {
  ArrowUpRight,
  ArrowDownRight,
  LineChart,
  BarChart3,
  Edit3,
  Download,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import html2canvas from "html2canvas";
import { useRef, useState } from "react";
import { ExportReport } from "@/components/dashboard/ExportReport";
import { Loader2 } from "lucide-react";

dayjs.extend(utc);
dayjs.extend(localizedFormat);

interface TradesTableProps {
  accountId?: number;
}

export const TradesTable = ({ accountId }: TradesTableProps) => {
  const { trades, isLoading } = useFilteredTrades(accountId);

  // --- Full History Export Handlers ---
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

    const rows = trades.map((t: any) => [
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
      t.close_reason,
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
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png");

      const doc = new jsPDF("p", "mm", "a4");
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = doc.internal.pageSize.getHeight();
      
      const imgProps = doc.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      doc.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);

      let startY = imgHeight + 10;
      if (startY > pdfHeight - 20) {
        doc.addPage();
        startY = 20;
      } else {
        doc.text("Detailed Trade List", 14, startY);
        startY += 10;
      }

      const tableData = trades.map((t: any) => [
        t.ticket,
        t.symbol,
        t.type === 0 ? "Buy" : "Sell",
        dayjs(t.close_time).format("YYYY-MM-DD HH:mm"),
        t.volume,
        Number(t.profit).toFixed(2),
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

  const handleExportCSV = (trade: any) => {
    const headers = [
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
    const row = [
      trade.symbol,
      trade.type === 0 ? "Buy" : trade.type === 1 ? "Sell" : trade.type,
      trade.open_time,
      trade.open_price,
      trade.close_time,
      trade.close_price,
      trade.volume,
      trade.profit,
      trade.commission,
      trade.swap,
      trade.close_reason,
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), row.join(",")].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `trade_${trade.ticket || trade.position_id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = (trade: any) => {
    const doc = new jsPDF();
    
    // --- Header ---
    doc.setFillColor(240, 240, 240);
    doc.rect(0, 0, 210, 40, "F");
    
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text("Trade Report", 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Ticket: ${trade.ticket || trade.position_id}`, 14, 30);
    doc.text(`Generated: ${dayjs().format("YYYY-MM-DD HH:mm")}`, 140, 30);

    // --- Trade Summary Block ---
    const isProfit = Number(trade.profit) > 0;
    const color = isProfit ? [34, 197, 94] : [239, 68, 68]; // Green or Red
    
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(1);
    doc.line(14, 45, 196, 45);

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`${trade.symbol} - ${trade.type === 0 ? "BUY" : "SELL"}`, 14, 55);
    
    doc.setFontSize(14);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(`${Number(trade.profit).toFixed(2)} USD`, 180, 55, { align: "right" });

    // --- Details Table ---
    const tableData = [
      ["Open Time", dayjs(trade.open_time).format("YYYY-MM-DD HH:mm:ss")],
      ["Close Time", dayjs(trade.close_time).format("YYYY-MM-DD HH:mm:ss")],
      ["Open Price", Number(trade.open_price).toFixed(5)],
      ["Close Price", Number(trade.close_price).toFixed(5)],
      ["Volume", Number(trade.volume).toFixed(2)],
      ["Commission", Number(trade.commission).toFixed(2)],
      ["Swap", Number(trade.swap).toFixed(2)],
      ["Close Reason", trade.close_reason || "-"],
      ["TP", Number(trade.tp_price || 0).toFixed(5)],
      ["SL", Number(trade.sl_price || 0).toFixed(5)],
    ];

    autoTable(doc, {
      startY: 65,
      head: [["Metric", "Value"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [50, 50, 50] },
      styles: { fontSize: 12, cellPadding: 6 },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 60 } },
    });

    // --- Footer ---
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("Generated by Trading Journal App", 105, 280, { align: "center" });

    doc.save(`trade_report_${trade.ticket || trade.position_id}.pdf`);
  };

  if (isLoading) {
    return (
      <Card className="p-4 border border-dashed rounded-2xl bg-secondary/20 text-center text-muted-foreground font-medium animate-pulse">
        Loading trades...
      </Card>
    );
  }

  if (!trades || trades.length === 0) {
    return (
      <Card className="p-4 border border-dashed rounded-2xl bg-secondary/20 text-center text-muted-foreground font-medium">
        No trades found for this account.
      </Card>
    );
  }

  return (
    <Card className="p-4 rounded-2xl border border-[#E5E7EB] bg-white/80 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex justify-end mb-4">
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
      </div>
      <div className="overflow-x-auto rounded-xl border border-border/60">
        <table className="min-w-full text-sm table-fixed">
          <thead className="bg-secondary/50 text-foreground font-semibold uppercase tracking-wide">
            <tr>
              <th className="px-5 py-3 text-left w-[10%]">Symbol</th>
              <th className="px-5 py-3 text-left w-[15%]">Open</th>
              <th className="px-5 py-3 text-left w-[15%]">Close</th>
              <th className="px-5 py-3 text-right w-[10%]">Volume</th>
              <th className="px-5 py-3 text-right w-[10%]">Side</th>
              <th className="px-5 py-3 text-right w-[15%]">Profit / Loss</th>
              <th className="px-5 py-3 text-right w-[15%]">TP/SL Hit</th>
              <th className="px-5 py-3 text-right w-[10%]">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E5E7EB] text-gray-700">
            {trades.map((trade: any) => {
              const isProfit = Number(trade.profit) > 0;
              const profitColor = isProfit ? "text-green-600" : "text-red-600";

              const positionSide =
                trade.type === 0
                  ? "Buy"
                  : trade.type === 1
                  ? "Sell"
                  : trade.type === 2
                  ? "Long"
                  : trade.type === 3
                  ? "Short"
                  : "N/A";

              let hitStatus = "-";
              const reason =
                trade.close_reason ?? trade.mt5_raw?.reason ?? trade.comment ?? "";
              const tp = Number(trade.tp_price ?? trade.tp ?? 0);
              const sl = Number(trade.sl_price ?? trade.sl ?? 0);
              const closePrice = Number(trade.close_price ?? 0);

              if (
                reason.toString().toLowerCase().includes("tp") ||
                Math.abs(closePrice - tp) < 1e-4
              ) {
                hitStatus = "TP Hit";
              } else if (
                reason.toString().toLowerCase().includes("sl") ||
                Math.abs(closePrice - sl) < 1e-4
              ) {
                hitStatus = "SL Hit";
              } else if (reason.toString().toLowerCase().includes("manual")) {
                hitStatus = "Manual Close";
              }

              return (
                <tr
                  key={trade.id ?? trade.position_id}
                  className="group hover:bg-secondary/30 transition-all duration-300"
                >
                  {/* Symbol */}
                  <td className="px-5 py-3 font-semibold text-foreground align-top">
                    <span className="text-brand-gradient">
                      {trade.symbol}
                    </span>
                  </td>

                  {/* Open */}
                  <td className="px-5 py-3 text-gray-700 align-top">
                    <div className="flex flex-col">
                      <span className="font-medium tabular-nums">
                        {Number(trade.open_price).toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {dayjs(trade.open_time).format("DD MMM HH:mm")}
                      </span>
                    </div>
                  </td>

                  {/* Close */}
                  <td className="px-5 py-3 text-gray-700 align-top">
                    <div className="flex flex-col">
                      <span className="font-medium tabular-nums">
                        {Number(trade.close_price).toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {dayjs(trade.close_time).format("DD MMM HH:mm")}
                      </span>
                    </div>
                  </td>

                  {/* Volume */}
                  <td className="px-5 py-3 text-right font-medium text-gray-700 tabular-nums align-top">
                    {Number(trade.volume).toFixed(2)}
                  </td>

                  {/* Side */}
                  <td className="px-5 py-3 text-right align-top">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        positionSide.toLowerCase().includes("buy") ||
                        positionSide.toLowerCase().includes("long")
                          ? "bg-green-50 text-green-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {positionSide}
                    </span>
                  </td>

                  {/* Profit / Loss */}
                  <td
                    className={`px-5 py-3 text-right font-semibold tabular-nums ${profitColor} align-top`}
                  >
                    <div className="flex items-center justify-end gap-1">
                      {isProfit ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                      )}
                      {Number(trade.profit).toFixed(2)}
                    </div>
                  </td>

                  {/* TP/SL Hit */}
                  <td
                    className={`px-5 py-3 text-right font-medium align-top ${
                      hitStatus === "TP Hit"
                        ? "text-green-600"
                        : hitStatus === "SL Hit"
                        ? "text-red-600"
                        : "text-gray-500"
                    }`}
                  >
                    {hitStatus}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3 text-right align-top">
                    <div className="flex items-center justify-end gap-3">
                      <Edit3 className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
                      <BarChart3 className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
                      <LineChart className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
                      
                      <Popover>
                        <PopoverTrigger asChild>
                          <Download className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
                        </PopoverTrigger>
                        <PopoverContent className="w-40 p-2">
                          <div className="flex flex-col gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="justify-start gap-2"
                              onClick={() => handleExportPDF(trade)}
                            >
                              <FileText className="h-4 w-4" />
                              PDF
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="justify-start gap-2"
                              onClick={() => handleExportCSV(trade)}
                            >
                              <FileSpreadsheet className="h-4 w-4" />
                              CSV
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ExportReport ref={reportRef} accountId={accountId} />
    </Card>
  );
};
