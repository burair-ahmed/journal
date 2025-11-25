import dayjs from "dayjs";

interface Trade {
  profit: number;
  commission: number;
  swap: number;
  close_time: string;
  symbol: string;
  account_id?: number;
  open_price: number;
  close_price: number;
  volume: number;
}

export interface AnnualSummary {
  totalPnL: number;
  tradeCount: number;
  totalCommissions: number;
  totalSwaps: number;
  netPnL: number;
}

export interface QuarterlyData {
  quarter: string;
  pnl: number;
  trades: number;
  sparklineData: number[];
}

export interface YearlyData {
  year: number;
  totalPnL: number;
  tradeCount: number;
  netPnL: number;
}

export interface AccountSummary {
  accountId: number;
  totalPnL: number;
  tradeCount: number;
  netPnL: number;
}

export const calculateAnnualSummary = (trades: Trade[], year?: number): AnnualSummary => {
  if (!trades || trades.length === 0) {
    return {
      totalPnL: 0,
      tradeCount: 0,
      totalCommissions: 0,
      totalSwaps: 0,
      netPnL: 0
    };
  }

  const filteredTrades = year 
    ? trades.filter(t => dayjs(t.close_time).year() === year)
    : trades;

  const totalPnL = filteredTrades.reduce((sum, t) => sum + Number(t.profit), 0);
  const totalCommissions = filteredTrades.reduce((sum, t) => sum + Math.abs(Number(t.commission || 0)), 0);
  const totalSwaps = filteredTrades.reduce((sum, t) => sum + Number(t.swap || 0), 0);
  const netPnL = totalPnL - totalCommissions + totalSwaps;

  return {
    totalPnL,
    tradeCount: filteredTrades.length,
    totalCommissions,
    totalSwaps,
    netPnL
  };
};

export const calculateQuarterlyBreakdown = (trades: Trade[], year: number): QuarterlyData[] => {
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const quarterlyData: QuarterlyData[] = [];

  quarters.forEach((quarter, index) => {
    const startMonth = index * 3;
    const endMonth = startMonth + 2;

    const quarterTrades = trades.filter(t => {
      const date = dayjs(t.close_time);
      return date.year() === year && date.month() >= startMonth && date.month() <= endMonth;
    });

    const pnl = quarterTrades.reduce((sum, t) => sum + Number(t.profit), 0);
    
    // Sparkline data (monthly breakdown within quarter)
    const sparklineData: number[] = [];
    for (let m = 0; m < 3; m++) {
      const monthPnL = quarterTrades
        .filter(t => dayjs(t.close_time).month() === startMonth + m)
        .reduce((sum, t) => sum + Number(t.profit), 0);
      sparklineData.push(monthPnL);
    }

    quarterlyData.push({
      quarter,
      pnl,
      trades: quarterTrades.length,
      sparklineData
    });
  });

  return quarterlyData;
};

export const calculateHistoricalYears = (trades: Trade[]): YearlyData[] => {
  if (!trades || trades.length === 0) return [];

  const yearMap: Record<number, { pnl: number; trades: number; commissions: number; swaps: number }> = {};

  trades.forEach(t => {
    const year = dayjs(t.close_time).year();
    if (!yearMap[year]) {
      yearMap[year] = { pnl: 0, trades: 0, commissions: 0, swaps: 0 };
    }
    yearMap[year].pnl += Number(t.profit);
    yearMap[year].trades += 1;
    yearMap[year].commissions += Math.abs(Number(t.commission || 0));
    yearMap[year].swaps += Number(t.swap || 0);
  });

  return Object.entries(yearMap)
    .map(([year, data]) => ({
      year: parseInt(year),
      totalPnL: data.pnl,
      tradeCount: data.trades,
      netPnL: data.pnl - data.commissions + data.swaps
    }))
    .sort((a, b) => b.year - a.year);
};

export const prepareAuditTrail = (trades: Trade[], year?: number) => {
  const filteredTrades = year 
    ? trades.filter(t => dayjs(t.close_time).year() === year)
    : trades;

  return filteredTrades.map(t => ({
    date: dayjs(t.close_time).format('YYYY-MM-DD HH:mm:ss'),
    symbol: t.symbol,
    profit: Number(t.profit),
    commission: Number(t.commission || 0),
    swap: Number(t.swap || 0),
    netPnL: Number(t.profit) - Math.abs(Number(t.commission || 0)) + Number(t.swap || 0),
    volume: t.volume,
    openPrice: t.open_price,
    closePrice: t.close_price
  }));
};

export const calculateAccountComparison = (trades: Trade[]): AccountSummary[] => {
  if (!trades || trades.length === 0) return [];

  const accountMap: Record<number, { pnl: number; trades: number; commissions: number; swaps: number }> = {};

  trades.forEach(t => {
    const accountId = t.account_id || 0;
    if (!accountMap[accountId]) {
      accountMap[accountId] = { pnl: 0, trades: 0, commissions: 0, swaps: 0 };
    }
    accountMap[accountId].pnl += Number(t.profit);
    accountMap[accountId].trades += 1;
    accountMap[accountId].commissions += Math.abs(Number(t.commission || 0));
    accountMap[accountId].swaps += Number(t.swap || 0);
  });

  return Object.entries(accountMap)
    .map(([accountId, data]) => ({
      accountId: parseInt(accountId),
      totalPnL: data.pnl,
      tradeCount: data.trades,
      netPnL: data.pnl - data.commissions + data.swaps
    }))
    .sort((a, b) => b.totalPnL - a.totalPnL);
};

export const generateTaxCSV = (trades: Trade[], year: number): string => {
  const auditTrail = prepareAuditTrail(trades, year);
  
  const headers = [
    'Date',
    'Symbol',
    'Volume',
    'Open Price',
    'Close Price',
    'Gross P&L',
    'Commission',
    'Swap',
    'Net P&L'
  ];

  const rows = auditTrail.map(t => [
    t.date,
    t.symbol,
    t.volume.toString(),
    t.openPrice.toFixed(5),
    t.closePrice.toFixed(5),
    t.profit.toFixed(2),
    t.commission.toFixed(2),
    t.swap.toFixed(2),
    t.netPnL.toFixed(2)
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csvContent;
};
