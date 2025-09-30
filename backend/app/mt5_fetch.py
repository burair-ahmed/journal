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
    for _, row in df.iterrows():
        trade = {
            "ticket": int(row["ticket"]),
            "symbol": row["symbol"],
            "deal_time": datetime.utcfromtimestamp(row["time"]).isoformat(),  # ✅ converted
            "type": int(row["type"]),
            "volume": float(row["volume"]),
            "price": float(row["price"]),
            "profit": float(row["profit"]),
            "comment": row.get("comment", ""),
            "order_id": int(row["order"]) if "order" in row and row["order"] else None,
            # Convert mt5_raw (dict) into JSON-safe structure
            "mt5_raw": {
                k: (v.isoformat() if isinstance(v, (datetime, pd.Timestamp)) else v)
                for k, v in row.to_dict().items()
            },
        }
        trades.append(trade)

    if trades:
        # ✅ Batch upsert for better performance
        supabase.table("trades").upsert(trades).execute()
        print(f"✅ {len(trades)} trades saved to Supabase")
    else:
        print("⚠️ No trades to save")
