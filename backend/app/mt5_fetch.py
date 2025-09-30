import MetaTrader5 as mt5
import pandas as pd
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from .db import supabase

load_dotenv()

# MT5 credentials
LOGIN = int(os.getenv("MT5_LOGIN"))
PASSWORD = os.getenv("MT5_PASSWORD")
SERVER = os.getenv("MT5_SERVER")
PATH = os.getenv("MT5_PATH")


def init_mt5():
    print("👉 Starting MT5 connection...")
    if not mt5.initialize(PATH, login=LOGIN, password=PASSWORD, server=SERVER):
        raise Exception(f"❌ MT5 initialization failed: {mt5.last_error()}")
    print("✅ Connected to MT5:", SERVER, "Account:", LOGIN)


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


def save_trades_to_supabase(df: pd.DataFrame):
    trades = []
    grouped = df.groupby("position_id")

    for position_id, group in grouped:
        group_sorted = group.sort_values("time")

        open_deal = group_sorted.iloc[0]
        close_deal = group_sorted.iloc[-1]

        trade = {
            "position_id": int(position_id),
            "symbol": str(open_deal["symbol"]),
            "type": int(open_deal["type"]),  # opening type (buy/sell)
            "open_time": datetime.utcfromtimestamp(int(open_deal["time"])).isoformat(),
            "close_time": datetime.utcfromtimestamp(int(close_deal["time"])).isoformat(),
            "open_price": float(open_deal["price"]),
            "close_price": float(close_deal["price"]),
            "volume": float(open_deal["volume"]),  # ✅ FIX: only take volume from open deal
            "profit": float(group["profit"].sum()),
            "commission": float(group["commission"].sum() if "commission" in group else 0),
            "swap": float(group["swap"].sum() if "swap" in group else 0),
            "comment": str(open_deal["comment"]) if "comment" in open_deal else "",
            "mt5_raw": group.to_dict(orient="records"),
        }

        trades.append(trade)

    if trades:
        supabase.table("trades").upsert(trades).execute()
        print(f"✅ {len(trades)} trades saved to Supabase (grouped by position_id)")
    else:
        print("⚠️ No trades to save")
