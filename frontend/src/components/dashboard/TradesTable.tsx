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
  Image,
  Calendar as CalendarIcon,
  X,
  TrendingUp,
  PlayCircle
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import html2canvas from "html2canvas";
import { useRef, useState, useMemo } from "react";
import { ExportReport } from "@/components/dashboard/ExportReport";
import { Loader2 } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { TradeChart } from '@/components/charts/TradeChart';

dayjs.extend(utc);
dayjs.extend(localizedFormat);

interface TradesTableProps {
  accountId?: number;
}

import { useNavigate } from "react-router-dom";

export const TradesTable = ({ accountId }: TradesTableProps) => {
  const { trades, isLoading } = useFilteredTrades(accountId);
  const { isImpersonating } = useAuthContext();
  const navigate = useNavigate();

  // --- Full History Export Handlers ---
  const reportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  // --- Date Range Filter State ---
  const [dateRangeType, setDateRangeType] = useState<string>("all");
  const [specificDate, setSpecificDate] = useState<Date | undefined>(undefined);
  const [dateRangeStart, setDateRangeStart] = useState<Date | undefined>(undefined);
  const [dateRangeEnd, setDateRangeEnd] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showRangePicker, setShowRangePicker] = useState(false);

  // --- Filter Trades Based on Date Range ---
  const filteredTrades = useMemo(() => {
    if (!trades) return [];
    
    const now = dayjs();
    
    switch (dateRangeType) {
      case "daily":
        return trades.filter((t: any) => 
          dayjs(t.close_time).isSame(now, 'day')
        );
      case "weekly":
        return trades.filter((t: any) => 
          dayjs(t.close_time).isSame(now, 'week')
        );
      case "monthly":
        return trades.filter((t: any) => 
          dayjs(t.close_time).isSame(now, 'month')
        );
      case "specific":
        if (!specificDate) return trades;
        return trades.filter((t: any) => 
          dayjs(t.close_time).isSame(dayjs(specificDate), 'day')
        );
      case "range":
        if (!dateRangeStart || !dateRangeEnd) return trades;
        return trades.filter((t: any) => {
          const closeTime = dayjs(t.close_time);
          return closeTime.isAfter(dayjs(dateRangeStart).startOf('day')) && 
                 closeTime.isBefore(dayjs(dateRangeEnd).endOf('day'));
        });
      default:
        return trades;
    }
  }, [trades, dateRangeType, specificDate, dateRangeStart, dateRangeEnd]);

  const handleExportFullCSV = () => {
    if (!filteredTrades || filteredTrades.length === 0) return;

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

    const rows = filteredTrades.map((t: any) => [
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
    if (!reportRef.current || !filteredTrades) return;
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

      const tableData = filteredTrades.map((t: any) => [
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

  const handleExportFullJPEG = async () => {
    if (!reportRef.current || !filteredTrades) return;
    setExporting(true);

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });
      
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const link = document.createElement("a");
      link.href = imgData;
      link.download = `full_report_${accountId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("JPEG export failed", err);
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

  const handleExportJPEG = async (trade: any) => {
    // Create a temporary container for the trade report
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.width = "800px";
    container.style.padding = "40px";
    container.style.backgroundColor = "#ffffff";
    container.style.fontFamily = "Arial, sans-serif";
    
    const isProfit = Number(trade.profit) > 0;
    const color = isProfit ? "#22c55e" : "#ef4444";
    
    container.innerHTML = `
      <div style="background: #f0f0f0; padding: 20px; margin-bottom: 20px;">
        <h1 style="margin: 0 0 10px 0; font-size: 28px; color: #282828;">Trade Report</h1>
        <p style="margin: 0; color: #646464; font-size: 14px;">Ticket: ${trade.ticket || trade.position_id}</p>
        <p style="margin: 0; color: #646464; font-size: 14px;">Generated: ${dayjs().format("YYYY-MM-DD HH:mm")}</p>
      </div>
      
      <div style="border-top: 3px solid ${color}; padding-top: 20px; margin-bottom: 20px;">
        <h2 style="font-size: 20px; margin: 0 0 10px 0;">${trade.symbol} - ${trade.type === 0 ? "BUY" : "SELL"}</h2>
        <p style="font-size: 18px; font-weight: bold; color: ${color}; margin: 0;">${Number(trade.profit).toFixed(2)} USD</p>
      </div>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr style="background: #f5f5f5;">
          <th style="padding: 12px; text-align: left; border: 1px solid #ddd; font-weight: bold;">Metric</th>
          <th style="padding: 12px; text-align: left; border: 1px solid #ddd; font-weight: bold;">Value</th>
        </tr>
        <tr><td style="padding: 10px; border: 1px solid #ddd;">Open Time</td><td style="padding: 10px; border: 1px solid #ddd;">${dayjs(trade.open_time).format("YYYY-MM-DD HH:mm:ss")}</td></tr>
        <tr><td style="padding: 10px; border: 1px solid #ddd;">Close Time</td><td style="padding: 10px; border: 1px solid #ddd;">${dayjs(trade.close_time).format("YYYY-MM-DD HH:mm:ss")}</td></tr>
        <tr><td style="padding: 10px; border: 1px solid #ddd;">Open Price</td><td style="padding: 10px; border: 1px solid #ddd;">${Number(trade.open_price).toFixed(5)}</td></tr>
        <tr><td style="padding: 10px; border: 1px solid #ddd;">Close Price</td><td style="padding: 10px; border: 1px solid #ddd;">${Number(trade.close_price).toFixed(5)}</td></tr>
        <tr><td style="padding: 10px; border: 1px solid #ddd;">Volume</td><td style="padding: 10px; border: 1px solid #ddd;">${Number(trade.volume).toFixed(2)}</td></tr>
        <tr><td style="padding: 10px; border: 1px solid #ddd;">Commission</td><td style="padding: 10px; border: 1px solid #ddd;">${Number(trade.commission).toFixed(2)}</td></tr>
        <tr><td style="padding: 10px; border: 1px solid #ddd;">Swap</td><td style="padding: 10px; border: 1px solid #ddd;">${Number(trade.swap).toFixed(2)}</td></tr>
        <tr><td style="padding: 10px; border: 1px solid #ddd;">Close Reason</td><td style="padding: 10px; border: 1px solid #ddd;">${trade.close_reason || "-"}</td></tr>
        <tr><td style="padding: 10px; border: 1px solid #ddd;">TP</td><td style="padding: 10px; border: 1px solid #ddd;">${Number(trade.tp_price || 0).toFixed(5)}</td></tr>
        <tr><td style="padding: 10px; border: 1px solid #ddd;">SL</td><td style="padding: 10px; border: 1px solid #ddd;">${Number(trade.sl_price || 0).toFixed(5)}</td></tr>
      </table>
      
      <div style="margin-top: 40px; text-align: center; color: #969696; font-size: 12px;">
        Generated by Trading Journal App
      </div>
    `;
    
    document.body.appendChild(container);
    
    try {
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });
      
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const link = document.createElement("a");
      link.href = imgData;
      link.download = `trade_report_${trade.ticket || trade.position_id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("JPEG export failed", err);
    } finally {
      document.body.removeChild(container);
    }
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
      <div className="flex justify-between items-start mb-4 gap-4">
        {/* Date Range Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={dateRangeType} onValueChange={(value) => {
            setDateRangeType(value);
            if (value === "specific") {
              setShowDatePicker(true);
            } else if (value === "range") {
              setShowRangePicker(true);
            }
          }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Trades</SelectItem>
              <SelectItem value="daily">Today</SelectItem>
              <SelectItem value="weekly">This Week</SelectItem>
              <SelectItem value="monthly">This Month</SelectItem>
              <SelectItem value="specific">Specific Date</SelectItem>
              <SelectItem value="range">Date Range</SelectItem>
            </SelectContent>
          </Select>

          {/* Specific Date Picker */}
          {dateRangeType === "specific" && (
            <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {specificDate ? dayjs(specificDate).format("MMM DD, YYYY") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={specificDate}
                  onSelect={(date) => {
                    setSpecificDate(date);
                    setShowDatePicker(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          )}

          {/* Date Range Picker */}
          {dateRangeType === "range" && (
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {dateRangeStart ? dayjs(dateRangeStart).format("MMM DD") : "Start"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRangeStart}
                    onSelect={setDateRangeStart}
                  />
                </PopoverContent>
              </Popover>
              
              <span className="text-muted-foreground">to</span>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {dateRangeEnd ? dayjs(dateRangeEnd).format("MMM DD") : "End"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRangeEnd}
                    onSelect={setDateRangeEnd}
                  />
                </PopoverContent>
              </Popover>

              {(dateRangeStart || dateRangeEnd) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setDateRangeStart(undefined);
                    setDateRangeEnd(undefined);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {/* Active Filter Display */}
          {dateRangeType !== "all" && (
            <div className="text-sm text-muted-foreground">
              {filteredTrades.length} of {trades?.length || 0} trades
            </div>
          )}
        </div>

        {/* Export Button */}
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
                onClick={handleExportFullJPEG}
              >
                <Image className="h-4 w-4" />
                JPEG Image
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
            {filteredTrades.map((trade: any) => {
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
                      {/* {!isImpersonating && (
                        <Edit3 className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
                      )} */}
    <Popover>
      <PopoverTrigger asChild>
        {/* <Button variant="ghost" size="icon"> */}
          <TrendingUp className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
        {/* </Button> */}
      </PopoverTrigger>
      <PopoverContent className="w-[900px] h-[700px] p-0">
        <TradeChart
          symbol={trade.symbol}
          accountId={trade.account_id}
          openTime={trade.open_time}
          closeTime={trade.close_time}
          entryPrice={trade.open_price}
          exitPrice={trade.close_price}
          tradeType={trade.type}
        />
      </PopoverContent>
    </Popover>
                      {/* <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/trade-replay?tradeId=${trade.id}`)}
                        title="Replay Trade"
                      > */}
                        <PlayCircle onClick={() => navigate(`/trade-replay?tradeId=${trade.id}`)} className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
                      {/* </Button> */}
                      {/* <LineChart className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors cursor-pointer" /> */}
                      
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
                              onClick={() => handleExportJPEG(trade)}
                            >
                              <Image className="h-4 w-4" />
                              JPEG
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

      {/* Hidden Export Report - Only used for PDF/JPEG generation */}
      <div className="hidden">
        <ExportReport ref={reportRef} accountId={accountId} />
      </div>
    </Card>
  );
};
