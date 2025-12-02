# ohlc_fetch.py - OHLC Data Sync Module (Daily Aggregated)
"""
Fetches OHLC (Open, High, Low, Close) data from MetaTrader 5
and syncs it to Supabase using server-based storage with daily JSONB aggregation.

OPTIMIZATION: Instead of 288 rows/day (for 5m), stores 1 row/day with JSONB array.
This reduces row count by 99.7% and improves query performance.
"""

import MetaTrader5 as mt5
import pandas as pd
from datetime import datetime, timedelta, date
from typing import List, Optional, Dict
import re
import json
from .db import supabase


# ============================================
# Normalization Functions
# ============================================

def normalize_server_name(server: str) -> str:
    """
    Normalize MT5 server name to prevent duplicates.
    Removes spaces, hyphens, and converts to lowercase.
    """
    return re.sub(r'[\s-]+', '', server.strip()).lower()


def normalize_symbol(symbol: str) -> str:
    """
    Normalize symbol names to prevent duplicates.
    Removes common broker suffixes and converts to uppercase.
    """
    normalized = re.sub(r'\.(a|i|m|e|c)$|_(a|i|m|e|c)$', '', symbol.strip(), flags=re.IGNORECASE)
    return normalized.upper()


# ============================================
# MT5 Timeframe Mapping
# ============================================

TIMEFRAME_MAP = {
    '1m': mt5.TIMEFRAME_M1,
    '3m': mt5.TIMEFRAME_M3,
    '5m': mt5.TIMEFRAME_M5,
    '30m': mt5.TIMEFRAME_M30,
    '1h': mt5.TIMEFRAME_H1,
    '4h': mt5.TIMEFRAME_H4,
    '1d': mt5.TIMEFRAME_D1,
}

# Default timeframes to sync
DEFAULT_TIMEFRAMES = ['5m', '1h', '1d']


# ============================================
# Data Validation
# ============================================

def validate_ohlc_candle(candle: Dict) -> bool:
    """
    Validate OHLC candle data before inserting.
    Format: {"time": "...", "o": ..., "h": ..., "l": ..., "c": ..., "v": ..., "tv": ..., "s": ...}
    """
    try:
        # Check required fields
        if not all(k in candle for k in ['time', 'o', 'h', 'l', 'c']):
            return False
        
        # Check high >= low
        if candle['h'] < candle['l']:
            print(f"⚠️ Invalid candle: high < low at {candle['time']}")
            return False
        
        # Check open/close within range
        if not (candle['l'] <= candle['o'] <= candle['h']):
            print(f"⚠️ Invalid candle: open outside range at {candle['time']}")
            return False
        
        if not (candle['l'] <= candle['c'] <= candle['h']):
            print(f"⚠️ Invalid candle: close outside range at {candle['time']}")
            return False
        
        # Check positive prices
        if any(candle[k] <= 0 for k in ['o', 'h', 'l', 'c']):
            print(f"⚠️ Invalid candle: non-positive price at {candle['time']}")
            return False
        
        return True
    except Exception as e:
        print(f"⚠️ Validation error: {e}")
        return False


# ============================================
# Smart Sync Logic
# ============================================

def check_existing_daily_data(server: str, symbol: str, timeframe: str, target_date: date) -> Optional[Dict]:
    """
    Check if OHLC data already exists for this server/symbol/timeframe/date.
    """
    try:
        normalized_server = normalize_server_name(server)
        normalized_symbol = normalize_symbol(symbol)
        
        # Query for specific date
        result = supabase.table('ohlc_data') \
            .select('*') \
            .eq('mt5_server', normalized_server) \
            .eq('symbol', normalized_symbol) \
            .eq('timeframe', timeframe) \
            .eq('date', target_date.isoformat()) \
            .execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        
        return None
    except Exception as e:
        print(f"Error checking existing data: {e}")
        return None


# ============================================
# MT5 Data Fetching
# ============================================

def fetch_ohlc_from_mt5(
    symbol: str,
    timeframe_str: str,
    start_date: datetime,
    end_date: datetime
) -> Optional[pd.DataFrame]:
    """
    Fetch OHLC data from MT5 for a specific symbol and timeframe.
    """
    try:
        timeframe = TIMEFRAME_MAP[timeframe_str]
        
        # Fetch rates from MT5
        rates = mt5.copy_rates_range(symbol, timeframe, start_date, end_date)
        
        if rates is None or len(rates) == 0:
            print(f"No data returned from MT5 for {symbol} {timeframe_str}")
            return None
        
        # Convert to DataFrame
        df = pd.DataFrame(rates)
        
        # Convert time to datetime
        df['time'] = pd.to_datetime(df['time'], unit='s', utc=True)
        
        return df
    
    except Exception as e:
        print(f"Error fetching OHLC from MT5: {e}")
        return None


# ============================================
# Data Transformation & Aggregation
# ============================================

def transform_to_daily_records(
    df: pd.DataFrame,
    server: str,
    symbol: str,
    timeframe: str
) -> List[Dict]:
    """
    Transform MT5 DataFrame to daily aggregated records.
    Groups candles by date into JSONB arrays.
    
    Returns: List of daily records, each containing all candles for that day.
    """
    normalized_server = normalize_server_name(server)
    normalized_symbol = normalize_symbol(symbol)
    
    # Add date column (trading date)
    df['date'] = df['time'].dt.date
    
    # Group by date
    daily_groups = df.groupby('date')
    
    records = []
    for trading_date, group in daily_groups:
        # Sort by timestamp
        group = group.sort_values('time')
        
        # Build candles array
        candles = []
        for _, row in group.iterrows():
            candle = {
                'time': row['time'].isoformat(),
                'o': float(row['open']),
                'h': float(row['high']),
                'l': float(row['low']),
                'c': float(row['close']),
                'v': int(row.get('real_volume', 0)),
                'tv': int(row.get('tick_volume', 0)),
                's': int(row.get('spread', 0))
            }
            
            # Validate individual candle
            if validate_ohlc_candle(candle):
                candles.append(candle)
        
        if not candles:
            continue
        
        # Create daily record
        record = {
            'mt5_server': normalized_server,
            'symbol': normalized_symbol,
            'timeframe': timeframe,
            'date': trading_date.isoformat(),
            'candles': candles,  # JSONB array
            'candle_count': len(candles),
            'first_candle_time': candles[0]['time'],
            'last_candle_time': candles[-1]['time']
        }
        
        records.append(record)
    
    return records


# ============================================
# Upsert with Merge Logic
# ============================================

def upsert_daily_ohlc_data(records: List[Dict]) -> int:
    """
    Upsert daily aggregated OHLC records.
    On conflict: merges candle arrays and updates metadata.
    
    Important: Supabase upsert with JSONB requires careful handling to avoid duplicates.
    """
    if not records:
        return 0
    
    try:
        processed_count = 0
        
        for record in records:
            # Check if this day already exists
            existing = check_existing_daily_data(
                server=record['mt5_server'],
                symbol=record['symbol'],
                timeframe=record['timeframe'],
                target_date=datetime.fromisoformat(record['date']).date()
            )
            
            if existing:
                # Merge with existing candles
                existing_candles = existing['candles']
                new_candles = record['candles']
                
                # Combine and deduplicate by time
                all_candles = existing_candles + new_candles
                
                # Remove duplicates (keep latest)
                unique_candles_dict = {c['time']: c for c in all_candles}
                merged_candles = sorted(unique_candles_dict.values(), key=lambda x: x['time'])
                
                # Update record with merged data
                record['candles'] = merged_candles
                record['candle_count'] = len(merged_candles)
                record['first_candle_time'] = merged_candles[0]['time']
                record['last_candle_time'] = merged_candles[-1]['time']
                
                # Update existing row
                supabase.table('ohlc_data') \
                    .update({
                        'candles': merged_candles,
                        'candle_count': len(merged_candles),
                        'first_candle_time': merged_candles[0]['time'],
                        'last_candle_time': merged_candles[-1]['time']
                    }) \
                    .eq('id', existing['id']) \
                    .execute()
                
                print(f"  → Updated existing day with {len(new_candles)} new candles (total: {len(merged_candles)})")
            else:
                # Insert new record
                supabase.table('ohlc_data').insert(record).execute()
                print(f"  → Inserted new day with {record['candle_count']} candles")
            
            processed_count += 1
        
        return processed_count
    
    except Exception as e:
        print(f"Error upserting daily OHLC data: {e}")
        print(f"Failed record sample: {records[0] if records else 'None'}")
        return 0


# ============================================
# High-Level Sync Functions
# ============================================

def sync_ohlc_for_symbol(
    server: str,
    symbol: str,
    timeframe: str,
    days_back: int = 90,
    mt5_already_connected: bool = False
) -> Dict:
    """
    Sync OHLC data for a specific symbol and timeframe with daily aggregation.
    """
    print(f"\n📊 Syncing {symbol} {timeframe} from {server}")
    
    # Calculate date range
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days_back)
    
    print(f"→ Fetching {days_back} days of data")
    
    # Fetch from MT5
    df = fetch_ohlc_from_mt5(symbol, timeframe, start_date, end_date)
    
    if df is None or df.empty:
        print(f"⚠️ No data fetched for {symbol} {timeframe}")
        return {
            'symbol': symbol,
            'timeframe': timeframe,
            'status': 'no_data',
            'days_processed': 0
        }
    
    # Transform to daily records
    daily_records = transform_to_daily_records(df, server, symbol, timeframe)
    
    if not daily_records:
        print(f"⚠️ No valid records after transformation")
        return {
            'symbol': symbol,
            'timeframe': timeframe,
            'status': 'invalid_data',
            'days_processed': 0
        }
    
    # Upsert to database
    count = upsert_daily_ohlc_data(daily_records)
    
    print(f"✓ Synced {count} days for {symbol} {timeframe}")
    
    return {
        'symbol': symbol,
        'timeframe': timeframe,
        'status': 'synced',
        'days_processed': count
    }


def sync_ohlc_for_account(
    account_id: int,
    timeframes: Optional[List[str]] = None,
    days_back: int = 90
) -> Dict:
    """
    Sync OHLC data for all traded symbols in an account.
    Uses daily aggregation for optimal storage.
    """
    timeframes = timeframes or DEFAULT_TIMEFRAMES
    
    print(f"\n🔄 Starting OHLC sync for account {account_id}")
    print(f"→ Daily aggregation mode (1 row per day)")
    
    # 1. Get account details
    try:
        result = supabase.table('accounts').select('*').eq('id', account_id).single().execute()
        account = result.data
        
        if not account:
            return {'error': 'Account not found', 'account_id': account_id}
    
    except Exception as e:
        return {'error': str(e), 'account_id': account_id}
    
    server = account['mt5_server']
    login = account['mt5_login']
    password = account['mt5_password']
    
    # 2. Connect to MT5
    if not mt5.initialize():
        return {'error': 'MT5 initialization failed', 'account_id': account_id}
    
    if not mt5.login(login, password, server):
        mt5.shutdown()
        return {'error': 'MT5 login failed', 'account_id': account_id}
    
    print(f"✓ Connected to MT5: {server}")
    
    # 3. Get traded symbols
    try:
        trades_result = supabase.table('trades') \
            .select('symbol') \
            .eq('account_id', account_id) \
            .execute()
        
        if not trades_result.data:
            mt5.shutdown()
            return {
                'account_id': account_id,
                'server': server,
                'symbols_synced': 0,
                'total_days': 0,
                'message': 'No trades found'
            }
        
        # Get unique symbols
        symbols = list(set(trade['symbol'] for trade in trades_result.data))
        print(f"→ Found {len(symbols)} unique symbols: {symbols}")
    
    except Exception as e:
        mt5.shutdown()
        return {'error': f'Failed to get symbols: {e}', 'account_id': account_id}
    
    # 4. Sync each symbol/timeframe
    results = []
    total_days = 0
    
    for symbol in symbols:
        for timeframe in timeframes:
            result = sync_ohlc_for_symbol(
                server=server,
                symbol=symbol,
                timeframe=timeframe,
                days_back=days_back,
                mt5_already_connected=True
            )
            results.append(result)
            total_days += result.get('days_processed', 0)
    
    # 5. Disconnect
    mt5.shutdown()
    print(f"\n✓ Sync complete for account {account_id}")
    print(f"✓ Total: {total_days} daily records (instead of {total_days * 288} individual candle rows for 5m)")
    
    return {
        'success': True,
        'account_id': account_id,
        'server': server,
        'symbols_synced': len(symbols),
        'timeframes_synced': timeframes,
        'total_days': total_days,
        'optimization': f'{total_days} rows instead of {total_days * 288} (99.7% reduction for 5m timeframe)',
        'details': results
    }


# ============================================
# Get Symbols to Sync (Helper)
# ============================================

def get_symbols_from_trades(account_id: int) -> List[str]:
    """
    Get unique symbols that have been traded in an account.
    """
    try:
        result = supabase.table('trades') \
            .select('symbol') \
            .eq('account_id', account_id) \
            .execute()
        
        if not result.data:
            return []
        
        symbols = list(set(trade['symbol'] for trade in result.data))
        return symbols
    
    except Exception as e:
        print(f"Error getting symbols: {e}")
        return []
