import MetaTrader5 as mt5
import pandas as pd
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from .db import supabase

load_dotenv()

# MT5 credentials (default, can be overridden dynamically per account)
LOGIN = int(os.getenv("MT5_LOGIN"))
PASSWORD = os.getenv("MT5_PASSWORD")
SERVER = os.getenv("MT5_SERVER")
PATH = os.getenv("MT5_PATH")


def connect_mt5(login: int = LOGIN, password: str = PASSWORD, server: str = SERVER):
    print(f"👉 Starting MT5 connection for {login}@{server}...")
    if not mt5.initialize(PATH, login=login, password=password, server=server):
        print(f"❌ MT5 initialization failed: {mt5.last_error()}")
        return False
    print("✅ Connected to MT5:", server, "Account:", login)
    return True


def shutdown_mt5():
    mt5.shutdown()
    print("🛑 MT5 connection closed")


def fetch_trades(days=90):
    utc_from = datetime.now() - timedelta(days=days)
    utc_to = datetime.now()

    deals = mt5.history_deals_get(utc_from, utc_to)
    if not deals:
        print("❌ No deals found:", mt5.last_error())
        return []

    df = pd.DataFrame(list(deals), columns=deals[0]._asdict().keys())
    return df


def serialize_trade(trade: dict) -> dict:
    """Convert datetime/timestamp objects inside a dict into JSON-serializable strings."""
    serialized = {}
    for k, v in trade.items():
        if isinstance(v, (datetime, pd.Timestamp)):
            serialized[k] = v.isoformat()
        else:
            serialized[k] = v
    return serialized


def save_trades_to_supabase(df: pd.DataFrame, account_id: int):
    trades = []
    grouped = df.groupby("position_id")

    for position_id, group in grouped:
        group_sorted = group.sort_values("time")

        open_deal = group_sorted.iloc[0]
        close_deal = group_sorted.iloc[-1]

        trade = {
            "account_id": account_id,
            "position_id": int(position_id),
            "ticket": int(open_deal.get("ticket", 0)),
            "order_id": int(open_deal.get("order", 0)),
            "symbol": str(open_deal["symbol"]),
            "type": int(open_deal["type"]),
            "open_time": datetime.utcfromtimestamp(int(open_deal["time"])).isoformat(),
            "close_time": datetime.utcfromtimestamp(int(close_deal["time"])).isoformat(),
            "open_price": float(open_deal["price"]),
            "close_price": float(close_deal["price"]),
            "volume": float(open_deal["volume"]),
            "profit": float(group["profit"].sum()),
            "commission": float(group["commission"].sum() if "commission" in group else 0),
            "swap": float(group["swap"].sum() if "swap" in group else 0),
            "comment": str(open_deal["comment"]) if "comment" in open_deal else "",
            "mt5_raw": group.to_dict(orient="records"),
        }

        trades.append(trade)

    if not trades:
        print("⚠️ No trades to save")
        return

    # ✅ Get existing trades for this account
    existing_resp = supabase.table("trades").select("position_id, profit").eq("account_id", account_id).execute()
    existing = {row["position_id"]: row for row in existing_resp.data} if existing_resp.data else {}

    new_trades = []
    updated_trades = []

    for trade in trades:
        position_id = trade["position_id"]

        # Check if trade already exists
        if position_id in existing:
            existing_trade = existing[position_id]

            # ✅ If profit is 0 in DB but new trade has updated info, update it
            if existing_trade.get("profit", 0) == 0 or trade["profit"] != existing_trade.get("profit"):
                updated_trades.append(trade)
        else:
            new_trades.append(trade)

    # ✅ Insert new trades
    if new_trades:
        supabase.table("trades").insert(new_trades).execute()
        print(f"✅ {len(new_trades)} new trades saved to Supabase for account {account_id}")

    # ✅ Update existing incomplete/changed trades
    for trade in updated_trades:
        supabase.table("trades") \
            .update({
                "profit": trade["profit"],
                "close_time": trade["close_time"],
                "close_price": trade["close_price"],
                "commission": trade["commission"],
                "swap": trade["swap"],
                "mt5_raw": trade["mt5_raw"]
            }) \
            .eq("account_id", account_id) \
            .eq("position_id", trade["position_id"]) \
            .execute()

    if updated_trades:
        print(f"🔁 {len(updated_trades)} trades updated with new profit/close data for account {account_id}")
    else:
        print("⚠️ No trades required updating")
