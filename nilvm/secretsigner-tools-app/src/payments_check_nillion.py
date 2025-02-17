import requests
import time
from web3 import Web3
from eth_utils import keccak
from eth_account.datastructures import SignedTransaction
from hexbytes import HexBytes
import rlp
from src.nillion_utils import sign_message, TxMessageParams
import streamlit as st

RPC_URL = f"https://base-sepolia.g.alchemy.com/v2/{st.secrets['alchemy_api_key']}"

# Initialize Web3
w3 = Web3()

def make_rpc_call(method, params):
    """Make a JSON-RPC call to the Ethereum node."""
    payload = {
        "id": 1,
        "jsonrpc": "2.0",
        "method": method,
        "params": params
    }
    headers = {
        "accept": "application/json",
        "content-type": "application/json"
    }
    response = requests.post(RPC_URL, json=payload, headers=headers)
    json_response = response.json()
    
    if "error" in json_response:
        raise Exception(f"RPC error: {json_response['error']}")
    if "result" not in json_response:
        raise Exception(f"Invalid RPC response: {json_response}")
        
    return json_response["result"]

def get_balance(address):
    """Get the ETH balance of an address."""
    balance_hex = make_rpc_call(
        "eth_getBalance",
        [address, "latest"]
    )
    balance_wei = int(balance_hex, 16)
    balance_eth = balance_wei / 10**18
    return balance_eth

def create_transaction_message_hash(unsigned_tx):
    """
    Create a message hash from an unsigned transaction following EIP-1559 format.
    Returns both the message and its hash for signing.
    """
    def to_int(value):
        if isinstance(value, str) and value.startswith('0x'):
            return int(value, 16)
        return value

    fields = [
        to_int(unsigned_tx['chainId']),
        to_int(unsigned_tx['nonce']),
        to_int(unsigned_tx['maxPriorityFeePerGas']),
        to_int(unsigned_tx['maxFeePerGas']),
        to_int(unsigned_tx['gas']),
        bytes.fromhex(unsigned_tx['to'][2:]),
        to_int(unsigned_tx['value']),
        unsigned_tx['data'],
        []  # Empty access list
    ]
    
    tx_type = bytes([to_int(unsigned_tx['type'])])
    encoded_fields = rlp.encode(fields)
    message_to_hash = tx_type + encoded_fields
    
    return {
        'message': message_to_hash, 
        'hashed': keccak(message_to_hash)
    }

async def send_transaction(
    amount_in_eth: float,
    to_address: str,
    from_address: str,
    store_id_private_key: str,
    user_key_seed: str = "demo",
    data: str = "LFG 🚀",
    chain_id: int = 84532,
    priority_fee_gwei: int = 2
) -> dict:
    """
    Transfer ETH using a private key stored in Nillion with a Nillion tECDSA signature.
    """
    if data.startswith('0x'):
        data_bytes = bytes.fromhex(data[2:])
    else:
        data_bytes = data.encode('utf-8')
    
    hex_data = '0x' + data_bytes.hex()
    balance = get_balance(from_address)
    
    if balance < amount_in_eth:
        raise Exception(f"Insufficient balance: have {balance:.4f} ETH, trying to send {amount_in_eth} ETH")
    
    nonce = int(make_rpc_call("eth_getTransactionCount", [from_address, "latest"]), 16)
    block = make_rpc_call("eth_getBlockByNumber", ["latest", False])
    base_fee = int(block["baseFeePerGas"], 16)
    priority_fee = priority_fee_gwei * 10**9
    max_fee = (5 * base_fee) + priority_fee

    tx = {
        'nonce': nonce,
        'to': to_address,
        'value': int(amount_in_eth * 10**18),
        'gas': 50000 if (hex_data == '0x' or not hex_data) else 50000 + (len(hex_data[2:]) // 2 * 16),
        'maxFeePerGas': max_fee,
        'maxPriorityFeePerGas': priority_fee,
        'chainId': chain_id,
        'type': 2,
        'data': data_bytes
    }

    max_tx_cost_eth = (max_fee * (50000 + (len(data_bytes) * 16))) / 10**18
    total_required = amount_in_eth + max_tx_cost_eth
    
    if balance < total_required:
        raise Exception(f"Insufficient balance for tx + gas: have {balance:.4f} ETH, need {total_required:.4f} ETH")

    tx_hash_data = create_transaction_message_hash(tx)
    signed = await sign_message(
        store_id_private_key=store_id_private_key,
        message_params=TxMessageParams(
            tx_hash=tx_hash_data['hashed'],
            message=tx_hash_data['message']
        ),
        user_key_seed=user_key_seed
    )
    
    r = int(signed['signature']['r'], 16)
    s = int(signed['signature']['s'], 16)
    v = 0  # EIP-1559 signature
    
    signed_fields = [
        tx['chainId'],
        tx['nonce'],
        tx['maxPriorityFeePerGas'],
        tx['maxFeePerGas'],
        tx['gas'],
        bytes.fromhex(tx['to'][2:]),
        tx['value'],
        tx['data'],
        [],
        v, r, s
    ]
    
    encoded_fields = rlp.encode(signed_fields)
    raw_tx = bytes([tx['type']]) + encoded_fields
    
    signed_tx = SignedTransaction(
        raw_transaction=HexBytes(raw_tx),
        hash=HexBytes(tx_hash_data['hashed']),
        r=r,
        s=s,
        v=v
    )
    
    tx_hash = make_rpc_call(
        "eth_sendRawTransaction",
        [Web3.to_hex(signed_tx.raw_transaction)]
    )
    
    while True:
        receipt = make_rpc_call(
            "eth_getTransactionReceipt",
            [tx_hash]
        )
        if receipt is not None:
            return receipt
        time.sleep(1)