import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Mail, Lock, Server, FolderOpen } from "lucide-react";
import tradingHero from "@/assets/trading-hero.jpg";

interface AuthPageProps {
  onAuthenticated: () => void;
}

export const AuthPage = ({ onAuthenticated }: AuthPageProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    mt5Login: "",
    mt5Password: "",
    mt5Server: "",
    mt5Path: ""
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login process
    setTimeout(() => {
      setIsLoading(false);
      onAuthenticated();
    }, 1500);
  };

  const handleMT5Setup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate MT5 connection and trade import
    setTimeout(() => {
      setIsLoading(false);
      onAuthenticated();
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${tradingHero})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/20"></div>
        </div>
        <div className="relative z-10 flex items-center justify-center p-12">
          <div className="max-w-md text-center space-y-6">
            <div className="flex items-center justify-center gap-2 mb-8">
              <TrendingUp className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">TradeJournal Pro</h1>
            </div>
            <h2 className="text-2xl font-semibold">Professional Trading Analytics</h2>
            <p className="text-muted-foreground">
              Connect your MT5 account and unlock powerful insights into your trading performance 
              with comprehensive analytics, real-time dashboards, and detailed P&L tracking.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-profit">+1,245</div>
                <div className="text-sm text-muted-foreground">Total Trades</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">68.5%</div>
                <div className="text-sm text-muted-foreground">Win Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Tabs defaultValue="login" className="space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-2xl font-bold">Welcome Back</h2>
              <p className="text-muted-foreground">
                Sign in to access your trading dashboard
              </p>
            </div>

            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="mt5">MT5 Setup</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <Card className="widget-card p-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="trader@example.com"
                        className="pl-10"
                        value={credentials.email}
                        onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        className="pl-10"
                        value={credentials.password}
                        onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="mt5" className="space-y-4">
              <Card className="widget-card p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Connect MT5 Account</h3>
                  <p className="text-sm text-muted-foreground">
                    Import your trades directly from MetaTrader 5
                  </p>
                </div>
                
                <form onSubmit={handleMT5Setup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="mt5Login">MT5 Login</Label>
                    <Input
                      id="mt5Login"
                      type="text"
                      placeholder="Your MT5 account number"
                      value={credentials.mt5Login}
                      onChange={(e) => setCredentials(prev => ({ ...prev, mt5Login: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mt5Password">MT5 Password</Label>
                    <Input
                      id="mt5Password"
                      type="password"
                      placeholder="Your MT5 password"
                      value={credentials.mt5Password}
                      onChange={(e) => setCredentials(prev => ({ ...prev, mt5Password: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mt5Server">Server</Label>
                    <div className="relative">
                      <Server className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="mt5Server"
                        type="text"
                        placeholder="e.g., MetaQuotes-Demo"
                        className="pl-10"
                        value={credentials.mt5Server}
                        onChange={(e) => setCredentials(prev => ({ ...prev, mt5Server: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mt5Path">Terminal Path</Label>
                    <div className="relative">
                      <FolderOpen className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="mt5Path"
                        type="text"
                        placeholder="C:/Program Files/MetaTrader 5/terminal64.exe"
                        className="pl-10"
                        value={credentials.mt5Path}
                        onChange={(e) => setCredentials(prev => ({ ...prev, mt5Path: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Connecting & Importing Trades..." : "Connect & Import Trades"}
                  </Button>
                </form>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Demo credentials: Any email/password will work for testing</p>
          </div>
        </div>
      </div>
    </div>
  );
};