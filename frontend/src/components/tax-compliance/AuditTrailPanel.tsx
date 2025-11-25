import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface AuditTrailEntry {
  date: string;
  symbol: string;
  profit: number;
  commission: number;
  swap: number;
  netPnL: number;
  volume: number;
  openPrice: number;
  closePrice: number;
}

interface AuditTrailPanelProps {
  auditTrail: AuditTrailEntry[];
}

export const AuditTrailPanel = ({ auditTrail }: AuditTrailPanelProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredTrail = auditTrail.filter(entry =>
    entry.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.date.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredTrail.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTrail = filteredTrail.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Card className="p-6 rounded-2xl">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-semibold">Audit Trail</h3>
          </div>
          <Badge variant="outline" className="text-xs">
            {filteredTrail.length} trades
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground">
          Complete trade log for tax compliance and audit purposes. All transactions are recorded with timestamps and net P&L calculations.
        </p>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by symbol or date..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium text-muted-foreground">Date</th>
                <th className="text-left p-2 font-medium text-muted-foreground">Symbol</th>
                <th className="text-right p-2 font-medium text-muted-foreground">Volume</th>
                <th className="text-right p-2 font-medium text-muted-foreground">Gross P&L</th>
                <th className="text-right p-2 font-medium text-muted-foreground">Commission</th>
                <th className="text-right p-2 font-medium text-muted-foreground">Net P&L</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTrail.map((entry, index) => {
                const isProfit = entry.netPnL >= 0;
                return (
                  <tr key={index} className="border-b hover:bg-secondary/20 transition-colors">
                    <td className="p-2 text-xs">{entry.date}</td>
                    <td className="p-2 font-medium">{entry.symbol}</td>
                    <td className="p-2 text-right">{entry.volume.toFixed(2)}</td>
                    <td className={`p-2 text-right font-medium ${entry.profit >= 0 ? 'text-profit' : 'text-loss'}`}>
                      ${entry.profit.toFixed(2)}
                    </td>
                    <td className="p-2 text-right text-loss">${Math.abs(entry.commission).toFixed(2)}</td>
                    <td className={`p-2 text-right font-bold ${isProfit ? 'text-profit' : 'text-loss'}`}>
                      ${Math.abs(entry.netPnL).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredTrail.length)} of {filteredTrail.length}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
