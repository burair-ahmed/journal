import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import dayjs from "dayjs";
import { Download, FileText } from "lucide-react";
import { useFilteredTrades } from "@/hooks/useTrades";

interface TaxComplianceProps {
  accountId?: number;
}

export const TaxCompliance = ({ accountId }: TaxComplianceProps) => {
  const { trades = [], isLoading } = useFilteredTrades(accountId);

  const taxData = useMemo(() => {
    if (!trades || trades.length === 0) {
      return {
        yearlyData: {},
        currentYear: dayjs().year(),
        totalPnL: 0,
        totalCommissions: 0,
        totalSwaps: 0,
        netPnL: 0,
        quarters: [],
        currentYearTrades: []
      };
    }

    const currentYear = dayjs().year();
    
    // Annual summary
    const yearlyData: Record<number, { profit: number; trades: number; volume: number }> = {};
    trades.forEach(t => {
      const year = dayjs(t.close_time).year();
      if (!yearlyData[year]) yearlyData[year] = { profit: 0, trades: 0, volume: 0 };
      yearlyData[year].profit += Number(t.profit);
      yearlyData[year].trades++;
      yearlyData[year].volume += Number(t.volume);
    });
    
    // Current year detailed
    const currentYearTrades = trades.filter(t => dayjs(t.close_time).year() === currentYear);
    const totalPnL = currentYearTrades.reduce((sum, t) => sum + Number(t.profit), 0);
    const totalCommissions = currentYearTrades.reduce((sum, t) => sum + Number(t.commission || 0), 0);
    const totalSwaps = currentYearTrades.reduce((sum, t) => sum + Number(t.swap || 0), 0);
    const netPnL = totalPnL + totalCommissions - totalSwaps;
    
    // Quarterly breakdown
    const quarters = [1, 2, 3, 4].map(q => {
      const qTrades = currentYearTrades.filter(t => Math.ceil(dayjs(t.close_time).month() / 3) === q);
      return {
        quarter: q,
        profit: qTrades.reduce((sum, t) => sum + Number(t.profit), 0),
        trades: qTrades.length
      };
    });
    
    return { yearlyData, currentYear, totalPnL, totalCommissions, totalSwaps, netPnL, quarters, currentYearTrades };
  }, [trades]);

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">Loading data...</div>
      </Card>
    );
  }

  if (!trades || trades.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">No trades available</div>
      </Card>
    );
  }

  const handleExportTaxReport = () => {
    // Generate CSV for tax purposes
    const headers = ['Date', 'Symbol', 'Type', 'Volume', 'Profit', 'Commission', 'Swap', 'Net P&L'];
    const rows = taxData.currentYearTrades.map(t => [
      dayjs(t.close_time).format('YYYY-MM-DD'),
      t.symbol,
      t.type === 0 ? 'Buy' : 'Sell',
      t.volume,
      t.profit,
      t.commission || 0,
      t.swap || 0,
      Number(t.profit) + Number(t.commission || 0) - Number(t.swap || 0)
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tax_report_${taxData.currentYear}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-2">Tax & Compliance</h2>
          <p className="text-muted-foreground">Annual tax reports and audit trails</p>
        </div>
        <Button onClick={handleExportTaxReport} className="gap-2">
          <Download className="h-4 w-4" />
          Export Tax Report
        </Button>
      </div>

      {/* Annual Tax Report */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">📅 {taxData.currentYear} Tax Year Summary</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-secondary/20 rounded-lg">
            <div className="text-sm text-muted-foreground">Total Realized P&L</div>
            <div className={`text-2xl font-bold ${taxData.totalPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
              ${taxData.totalPnL.toFixed(2)}
            </div>
          </div>
          <div className="p-4 bg-secondary/20 rounded-lg">
            <div className="text-sm text-muted-foreground">Trade Count</div>
            <div className="text-2xl font-bold">{taxData.currentYearTrades.length}</div>
          </div>
          <div className="p-4 bg-secondary/20 rounded-lg">
            <div className="text-sm text-muted-foreground">Total Commissions</div>
            <div className="text-2xl font-bold text-loss">${Math.abs(taxData.totalCommissions).toFixed(2)}</div>
          </div>
          <div className="p-4 bg-secondary/20 rounded-lg">
            <div className="text-sm text-muted-foreground">Net P&L</div>
            <div className={`text-2xl font-bold ${taxData.netPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
              ${taxData.netPnL.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Quarterly Breakdown */}
        <div>
          <h4 className="font-semibold mb-3">Quarterly Breakdown</h4>
          <div className="grid grid-cols-4 gap-3">
            {taxData.quarters.map(q => (
              <div key={q.quarter} className="p-3 bg-secondary/20 rounded-lg text-center">
                <div className="text-sm text-muted-foreground">Q{q.quarter}</div>
                <div className={`text-lg font-bold ${q.profit >= 0 ? 'text-profit' : 'text-loss'}`}>
                  ${q.profit.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">{q.trades} trades</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Historical Years */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Historical Tax Years</h3>
        <div className="space-y-2">
          {Object.entries(taxData.yearlyData)
            .sort(([a], [b]) => Number(b) - Number(a))
            .map(([year, data]) => (
              <div key={year} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                <div>
                  <div className="font-medium">{year}</div>
                  <div className="text-sm text-muted-foreground">{data.trades} trades</div>
                </div>
                <div className={`text-lg font-bold ${data.profit >= 0 ? 'text-profit' : 'text-loss'}`}>
                  ${data.profit.toFixed(2)}
                </div>
              </div>
            ))}
        </div>
      </Card>

      {/* Audit Trail */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">📝 Audit Trail</h3>
        <div className="space-y-3">
          <div className="p-4 bg-secondary/20 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Complete Trade Log</span>
              <span className="text-sm text-muted-foreground">{trades.length} entries</span>
            </div>
            <p className="text-sm text-muted-foreground">
              All trades with timestamps, modifications, and complete transaction history
            </p>
          </div>
          
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-sm text-primary">
              <strong>📌 Note:</strong> This report is formatted for tax filing purposes. 
              Consult with a tax professional for specific guidance on reporting trading income.
            </p>
          </div>
        </div>
      </Card>

      {/* Broker Comparison */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">🏦 Broker/Account Performance</h3>
        <div className="p-4 bg-secondary/20 rounded-lg text-center">
          <div className="text-sm text-muted-foreground mb-2">Account ID</div>
          <div className="text-2xl font-bold">#{taxData.currentYearTrades[0]?.account_id || 'N/A'}</div>
          <p className="text-sm text-muted-foreground mt-2">
            Multi-account comparison available with multiple connected accounts
          </p>
        </div>
      </Card>
    </div>
  );
};
