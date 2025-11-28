/**
 * Mentee Detail View
 * Read-only dashboard view for mentors to see their mentee's trading data
 */

"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react";
import { useUI } from "@/contexts/UIContext";
import dayjs from "dayjs";

interface MenteeTrade {
  id: number;
  symbol: string;
  entry_date: string;
  exit_date: string;
  entry_price: number;
  exit_price: number;
  profit: number | null;
  status: string;
  setup: string;
  notes: string;
}

export const MenteeDetailView: React.FC = () => {
  const { menteeViewId, setActiveView } = useUI();
  const [trades, setTrades] = useState<MenteeTrade[]>([]);
  const [menteeEmail, setMenteeEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [canShowPnl, setCanShowPnl] = useState(false);

  useEffect(() => {
    if (menteeViewId) {
      fetchMenteeData();
    }
  }, [menteeViewId]);

  const fetchMenteeData = async () => {
    if (!menteeViewId) return;
    
    try {
      setIsLoading(true);

      // Fetch mentee email
      const { data: email } = await supabase.rpc('get_user_email_by_id', { user_uuid: menteeViewId });
      setMenteeEmail(email || "Student");

      // Fetch trades using the RPC function
      const { data: tradesData, error } = await supabase.rpc('get_mentee_trades', { 
        mentee_user_id: menteeViewId 
      });

      if (error) throw error;

      // Check if we can see P&L (if profit is not null)
      setCanShowPnl(tradesData && tradesData.length > 0 && tradesData[0].profit !== null);
      setTrades(tradesData || []);
    } catch (err: any) {
      console.error('Error fetching mentee data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = () => {
    const totalTrades = trades.length;
    const winningTrades = trades.filter(t => t.status === 'WIN').length;
    const losingTrades = trades.filter(t => t.status === 'LOSS').length;
    const winRate = totalTrades > 0 ? ((winningTrades / totalTrades) * 100).toFixed(1) : '0';
    
    let totalProfit = 0;
    if (canShowPnl) {
      totalProfit = trades.reduce((sum, t) => sum + (t.profit || 0), 0);
    }

    return { totalTrades, winningTrades, losingTrades, winRate, totalProfit };
  };

  const stats = calculateStats();

  if (!menteeViewId) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <p className="text-muted-foreground">No mentee selected</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setActiveView('mentorMode')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{menteeEmail}'s Dashboard</h1>
            <p className="text-muted-foreground">Read-only view of your mentee's trading activity</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Trades</p>
              <p className="text-2xl font-bold">{stats.totalTrades}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Winning Trades</p>
              <p className="text-2xl font-bold text-green-600">{stats.winningTrades}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Losing Trades</p>
              <p className="text-2xl font-bold text-red-600">{stats.losingTrades}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Win Rate</p>
              <p className="text-2xl font-bold">{stats.winRate}%</p>
            </div>
          </div>
        </Card>
      </div>

      {canShowPnl && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total P&L</h3>
          <p className={`text-3xl font-bold ${stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${stats.totalProfit.toFixed(2)}
          </p>
        </Card>
      )}

      {/* Trades Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Trades</h3>
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Loading...</p>
        ) : trades.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No trades yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Symbol</th>
                  <th className="text-left p-3">Entry</th>
                  <th className="text-left p-3">Exit</th>
                  <th className="text-left p-3">Entry Price</th>
                  <th className="text-left p-3">Exit Price</th>
                  {canShowPnl && <th className="text-left p-3">P&L</th>}
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => (
                  <tr key={trade.id} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-medium">{trade.symbol}</td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {dayjs(trade.entry_date).format('MMM D, YYYY')}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {trade.exit_date ? dayjs(trade.exit_date).format('MMM D, YYYY') : '-'}
                    </td>
                    <td className="p-3">${trade.entry_price?.toFixed(2)}</td>
                    <td className="p-3">${trade.exit_price?.toFixed(2)}</td>
                    {canShowPnl && (
                      <td className={`p-3 font-semibold ${(trade.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${trade.profit?.toFixed(2)}
                      </td>
                    )}
                    <td className="p-3">
                      <Badge variant={trade.status === 'WIN' ? 'default' : trade.status === 'LOSS' ? 'destructive' : 'secondary'}>
                        {trade.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
