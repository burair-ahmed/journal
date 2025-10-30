import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Mail, Lock, BarChart3, LineChart } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import tradingHero from "@/assets/trading-hero.jpg";
import { useAuthContext } from "@/contexts/AuthContext";

export const AuthPage = () => {
  const { login } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "" });

  // --- LOGIN ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(credentials.email, credentials.password);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- REGISTER ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
      });
      if (error) throw error;

      if (data?.user) {
        await supabase.from("users").upsert(
          {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name ?? null,
          },
          { onConflict: "id" }
        );
      }

      alert("Registration successful! Please check your email to confirm.");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-r from-[#FDF4FF] to-[#FCE7F3]">
      {/* Left Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden rounded-r-[3rem]">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105 transform"
          style={{ backgroundImage: `url(${tradingHero})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED]/70 via-[#DB2777]/30 to-transparent" />
              <div className="relative z-10 flex flex-col justify-center px-16 py-20 text-white space-y-10 max-w-lg">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-3">
              Analyze Your Trades. <br /> Grow Your Edge.
            </h1>
            <p className="text-gray-100 text-base leading-relaxed">
              TradeJournal Pro helps traders track every position, identify
              performance patterns, and level up with real analytics — all in
              one beautiful dashboard.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-2">
            <div>
              <div className="text-3xl font-bold text-white">+3,200</div>
              <div className="text-sm text-gray-200">Trades Logged</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#FDE047]">72.3%</div>
              <div className="text-sm text-gray-200">Avg Win Rate</div>
            </div>
          </div>

          <div className="pt-4 space-y-3 text-sm text-gray-100">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#FDE047]" />
              <span>Visualize P/L over time</span>
            </div>
            <div className="flex items-center gap-2">
              <LineChart className="w-4 h-4 text-[#FDE047]" />
              <span>Identify your top-performing setups</span>
            </div>
          </div>
        </div>

      </div>

      {/* Auth Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10 sm:px-10">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-3xl shadow-lg border border-[#E5E7EB]/60 p-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-[#1E1E1E]">
              Welcome Back 👋
            </h2>
            <p className="text-gray-600 text-sm">
              Sign in or create a new account below
            </p>
          </div>

          <Tabs defaultValue="login" className="space-y-8">
            <TabsList className="grid grid-cols-2 rounded-full border border-[#E5E7EB]/70 bg-[#F9FAFB] p-1">
              <TabsTrigger
                value="login"
                className="rounded-full text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#7C3AED] data-[state=active]:to-[#DB2777] data-[state=active]:text-white font-semibold"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="rounded-full text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#7C3AED] data-[state=active]:to-[#DB2777] data-[state=active]:text-white font-semibold"
              >
                Register
              </TabsTrigger>
            </TabsList>

            {/* LOGIN FORM */}
            <TabsContent value="login">
              <Card className="p-6 border border-[#E5E7EB]/60 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="trader@example.com"
                        className="pl-10"
                        value={credentials.email}
                        onChange={(e) =>
                          setCredentials((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        className="pl-10"
                        value={credentials.password}
                        onChange={(e) =>
                          setCredentials((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#7C3AED] to-[#DB2777] hover:opacity-90 text-white font-semibold transition-all rounded-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </Card>
            </TabsContent>

            {/* REGISTER FORM */}
            <TabsContent value="register">
              <Card className="p-6 border border-[#E5E7EB]/60 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <form onSubmit={handleRegister} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="trader@example.com"
                        className="pl-10"
                        value={credentials.email}
                        onChange={(e) =>
                          setCredentials((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="reg-password"
                        type="password"
                        placeholder="Choose a password"
                        className="pl-10"
                        value={credentials.password}
                        onChange={(e) =>
                          setCredentials((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#7C3AED] to-[#DB2777] hover:opacity-90 text-white font-semibold transition-all rounded-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? "Registering..." : "Register"}
                  </Button>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
