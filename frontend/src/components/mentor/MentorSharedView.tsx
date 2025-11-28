/**
 * Mentor Shared View
 * The read-only dashboard seen by the mentor when accessing via a magic link
 */

"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Shield, AlertCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface SharedTrade {
  id: number;
  symbol: string;
  entry_date: string;
  exit_date: string;
  entry_price: number;
  exit_price: number;
  profit: number | null; // Null if hidden
  status: string;
  setup: string;
  notes: string;
}

export const MentorSharedView: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [trades, setTrades] = useState<SharedTrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mentorLabel, setMentorLabel] = useState<string>("");

  useEffect(() => {
    const fetchSharedData = async () => {
      if (!token) return;

      try {
        setIsLoading(true);
        
        // 1. Validate Token & Get Metadata
        // We can't directly query the table due to RLS, but we can try the RPC
        // Actually, for the label, we might need a separate RPC or just infer from context
        // For now, let's just fetch the trades using the secure RPC
        
        const { data, error } = await supabase
          .rpc('get_shared_trades', { lookup_token: token });

        if (error) throw error;
        
        setTrades(data || []);
      } catch (err: any) {
        console.error("Error fetching shared data:", err);
        setError(err.message || "Invalid or expired access link.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedData();
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Verifying secure access...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full p-8 text-center border-destructive/50">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <p className="text-sm text-muted-foreground">
            Please ask the trader to generate a new link.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center text-white font-bold text-sm">
              T
            </div>
            <span className="text-xl font-bold tracking-wide">Tradlyn</span>
            <Badge variant="secondary" className="ml-2 flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Mentor View
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            Viewing as Mentor
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Trade Journal</h1>
          <p className="text-muted-foreground">
            Reviewing recent trading performance and setups.
          </p>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Setup</TableHead>
                  <TableHead className="text-right">Entry</TableHead>
                  <TableHead className="text-right">Exit</TableHead>
                  <TableHead className="text-right">P&L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      No trades found for this period.
                    </TableCell>
                  </TableRow>
                ) : (
                  trades.map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell className="font-medium">
                        {dayjs(trade.entry_date).format("MMM DD, HH:mm")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{trade.symbol}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            trade.status === "WIN" ? "default" : 
                            trade.status === "LOSS" ? "destructive" : 
                            "secondary"
                          }
                          className={
                            trade.status === "WIN" ? "bg-green-500 hover:bg-green-600" : ""
                          }
                        >
                          {trade.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{trade.setup || "-"}</TableCell>
                      <TableCell className="text-right font-mono">
                        {trade.entry_price?.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {trade.exit_price?.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold">
                        {trade.profit !== null ? (
                          <span className={trade.profit >= 0 ? "text-green-500" : "text-red-500"}>
                            {trade.profit >= 0 ? "+" : ""}{trade.profit.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground flex justify-end">
                            <Shield className="h-4 w-4" />
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>
    </div>
  );
};
