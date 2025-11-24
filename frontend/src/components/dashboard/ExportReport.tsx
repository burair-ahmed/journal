import { forwardRef } from "react";
import { TradeWinWidget } from "./widgets/TradeWinWidget";
import { WinLossSymbolDistribution } from "./widgets/WinLossSymbolDistribution";
import { TradezellaCalendar } from "./TradezellaCalendar";

interface ExportReportProps {
  accountId?: number;
}

export const ExportReport = forwardRef<HTMLDivElement, ExportReportProps>(
  ({ accountId }, ref) => {
    return (
      <div
        ref={ref}
        className="p-8 bg-white space-y-8 w-[1000px]" // Fixed width for consistent PDF capture
        style={{ position: "absolute", left: "-9999px", top: 0 }} // Off-screen
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Trade History Report</h1>
          <p className="text-gray-500">
            Generated on {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-1">
            <h2 className="text-xl font-semibold mb-4">Win Rate</h2>
            <TradeWinWidget accountId={accountId} />
          </div>
          <div className="col-span-1">
            <h2 className="text-xl font-semibold mb-4">Symbol Distribution</h2>
            <WinLossSymbolDistribution accountId={accountId} />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Calendar Performance</h2>
          <TradezellaCalendar accountId={accountId} />
        </div>
      </div>
    );
  }
);

ExportReport.displayName = "ExportReport";
