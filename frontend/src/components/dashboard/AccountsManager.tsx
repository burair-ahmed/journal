import { useState } from "react";
import { Eye, EyeOff, PlusCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAccounts, useCreateAccount } from "@/hooks/useAccounts";
import { useAuthContext } from "@/contexts/AuthContext";

export const AccountsManager = () => {
  const { user, loading, isImpersonating } = useAuthContext();
  const { data: accounts, isLoading } = useAccounts(user?.id);
  const createAccount = useCreateAccount();

  const [form, setForm] = useState({
    mt5_login: "",
    mt5_password: "",
    mt5_server: "",
    alias: "",
  });

  const [showPasswords, setShowPasswords] = useState<Record<number, boolean>>({});

  if (loading) return <p className="text-gray-500">Loading user...</p>;
  if (!user) return <p>Please login first.</p>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    await createAccount.mutateAsync({
      user_id: user.id,
      mt5_login: Number(form.mt5_login),
      mt5_password: form.mt5_password,
      mt5_server: form.mt5_server,
      alias: form.alias || null,
    });

    setForm({ mt5_login: "", mt5_password: "", mt5_server: "", alias: "" });
  };

  const togglePassword = (id: number) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-10">
      {/* 🌈 Accounts Grid */}
      <section>
        <h2 className="text-xl font-bold text-[#1E1E1E] mb-6">
          Your MT5 Accounts
        </h2>
        {isLoading ? (
          <p className="text-gray-500">Loading accounts...</p>
        ) : accounts && accounts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((acc) => (
              <Card
                key={acc.id}
                className="rounded-2xl border border-[#E5E7EB] bg-gradient-to-br from-[#FDF4FF]/80 to-[#FCE7F3]/70 hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-5 flex flex-col space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-[#7D3AEB]">
                      {acc.alias || `MT5 ${acc.mt5_login}`}
                    </h3>
                    <p className="text-sm font-medium text-[#1E1E1E]">
                      Account: <span className="text-[#6B7280]">{acc.mt5_login}</span>
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-[#1E1E1E]">
                      Server:{" "}
                      <span className="text-[#6B7280]">{acc.mt5_server}</span>
                    </p>
                  </div>

                  <div className="relative">
                    <p className="text-sm font-medium text-[#1E1E1E] mb-1">
                      Password:
                    </p>
                    <div className="flex items-center bg-white border border-[#E5E7EB] rounded-lg px-3 py-2">
                      <input
                        type={showPasswords[acc.id] ? "text" : "password"}
                        value={acc.mt5_password}
                        readOnly
                        className="flex-1 bg-transparent outline-none text-sm text-[#1E1E1E]"
                      />
                      <button
                        type="button"
                        onClick={() => togglePassword(acc.id)}
                        className="ml-2 text-[#7D3AEB] hover:text-[#D946EF] transition-colors"
                      >
                        {showPasswords[acc.id] ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No accounts added yet.</p>
        )}
      </section>

      {/* ➕ Add New Account */}
      {!isImpersonating && (
        <section>
          <Card className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <PlusCircle className="text-[#7D3AEB]" />
                <h2 className="text-xl font-semibold text-[#1E1E1E]">
                  Add New Account
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="login" className="text-[#6B7280]">MT5 Login</Label>
                  <Input
                    id="login"
                    type="number"
                    value={form.mt5_login}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, mt5_login: e.target.value }))
                    }
                    required
                    className="border-[#E5E7EB] focus:border-[#7D3AEB] focus:ring-[#7D3AEB]"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-[#6B7280]">MT5 Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={form.mt5_password}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, mt5_password: e.target.value }))
                    }
                    required
                    className="border-[#E5E7EB] focus:border-[#7D3AEB] focus:ring-[#7D3AEB]"
                  />
                </div>

                <div>
                  <Label htmlFor="server" className="text-[#6B7280]">MT5 Server</Label>
                  <Input
                    id="server"
                    type="text"
                    placeholder="e.g., ICMarkets-Demo01"
                    value={form.mt5_server}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, mt5_server: e.target.value }))
                    }
                    required
                    className="border-[#E5E7EB] focus:border-[#7D3AEB] focus:ring-[#7D3AEB]"
                  />
                </div>

                <div>
                  <Label htmlFor="alias" className="text-[#6B7280]">Alias (optional)</Label>
                  <Input
                    id="alias"
                    type="text"
                    placeholder="My Demo Account"
                    value={form.alias}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, alias: e.target.value }))
                    }
                    className="border-[#E5E7EB] focus:border-[#7D3AEB] focus:ring-[#7D3AEB]"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end mt-4">
                  <Button
                    type="submit"
                    disabled={createAccount.isPending}
                    className="bg-[#7D3AEB] hover:bg-[#D946EF] text-white px-6 py-2 rounded-xl transition-all"
                  >
                    {createAccount.isPending ? "Adding..." : "Add Account"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
};
