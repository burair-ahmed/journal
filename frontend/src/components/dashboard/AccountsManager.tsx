import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAccounts, useCreateAccount } from "@/hooks/useAccounts";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

export const AccountsManager = () => {
  const { user, loading } = useAuth();
  const { data: accounts, isLoading } = useAccounts(user?.id);
  const createAccount = useCreateAccount();

  const [form, setForm] = useState({
    mt5_login: "",
    mt5_password: "",
    mt5_server: "",
    alias: "",
  });

  if (loading) return <p>Loading user...</p>;
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

  return (
    <div className="space-y-6">
      {/* Accounts List */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Your MT5 Accounts</h2>
        {isLoading ? (
          <p>Loading accounts...</p>
        ) : accounts && accounts.length > 0 ? (
          <ul className="space-y-2">
            {accounts.map((acc) => (
              <li
                key={acc.id}
                className="flex justify-between items-center border p-2 rounded"
              >
                <div>
                  <div className="font-medium">
                    {acc.alias || `MT5 ${acc.mt5_login}`}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Server: {acc.mt5_server}
                  </div>
                </div>
                <Link to={`/accounts/${acc.id}`}>
                  <Button variant="outline" size="sm">
                    View Account
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>No accounts added yet.</p>
        )}
      </Card>

      {/* Add New Account */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Add New Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="login">MT5 Login</Label>
            <Input
              id="login"
              type="number"
              value={form.mt5_login}
              onChange={(e) =>
                setForm((f) => ({ ...f, mt5_login: e.target.value }))
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="password">MT5 Password</Label>
            <Input
              id="password"
              type="password"
              value={form.mt5_password}
              onChange={(e) =>
                setForm((f) => ({ ...f, mt5_password: e.target.value }))
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="server">MT5 Server</Label>
            <Input
              id="server"
              type="text"
              placeholder="e.g., ICMarkets-Demo01"
              value={form.mt5_server}
              onChange={(e) =>
                setForm((f) => ({ ...f, mt5_server: e.target.value }))
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="alias">Alias (optional)</Label>
            <Input
              id="alias"
              type="text"
              placeholder="My Demo Account"
              value={form.alias}
              onChange={(e) =>
                setForm((f) => ({ ...f, alias: e.target.value }))
              }
            />
          </div>

          <Button type="submit" disabled={createAccount.isPending}>
            {createAccount.isPending ? "Adding..." : "Add Account"}
          </Button>
        </form>
      </Card>
    </div>
  );
};
