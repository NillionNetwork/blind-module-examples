import streamlit as st
import asyncio
from src.payments_check_nillion import send_transaction, get_balance, make_rpc_call

def render():
    st.title("Transfer ETH")
    st.write("Send [Base Sepolia Testnet ETH](https://docs.base.org/docs/tools/network-faucets/) using a private key stored in Nillion")

    # Input fields
    col1, col2 = st.columns(2)
    
    with col1:

        store_id = st.text_input(
            "Nillion Store ID of the private key",
            value=st.secrets.get("nillion_default_store_id", "")
        )

        from_address = st.text_input(
            "From Address",
            value=st.secrets.get("nillion_default_from_address", ""),
            help="This is the ETH address corresponding to the private key stored in Nillion"
        )
        
        data = st.text_input(
            "Message",
            value="LFG 🚀",
        )

        amount = st.slider(
            "Transfer amount (ETH)", 
            min_value=0.0,
            max_value=0.001,
            value=0.0001,
            step=0.0001,
            format="%.6f"
        )
        
    with col2:
        user_key_seed = st.text_input(
            "Password (User Key Seed)",
            value=st.secrets.get("nillion_default_user_key_seed", ""),
            type="password",
            help="This seed is used to generate a user key/id that has been given permission to sign with the private key stored in Nillion"
        )

        to_address = st.text_input(
            "To Address",
            value=st.secrets.get("nillion_default_to_address", "")
        )
        
        priority_fee = st.number_input(
            "Priority Fee (Gwei)",
            value=10,
            min_value=1
        )

        chain_id = st.number_input(
            "Chain ID: Base Sepolia",
            value=84532,
            help="For now only Base Sepolia is supported",
            disabled=True
        )

    # Show current balance and estimated costs
    if from_address:
        try:
            balance = get_balance(from_address)
            
            with st.expander(f"💰 Balance & Gas Estimation for {from_address}"):
                st.info(f"Current balance: {balance:.6f} ETH")

                # Calculate estimated gas costs using same logic as send_transaction
                block = make_rpc_call("eth_getBlockByNumber", ["latest", False])
                base_fee = int(block["baseFeePerGas"], 16)
                priority_fee_wei = priority_fee * 10**9  # Convert gwei to wei
                max_fee = (2 * base_fee) + priority_fee_wei

                # Calculate gas limit based on data (match send_transaction)
                if data.startswith('0x'):
                    data_bytes = bytes.fromhex(data[2:])
                else:
                    data_bytes = data.encode('utf-8')
                
                hex_data = '0x' + data_bytes.hex()
                gas_limit = 50000 if (hex_data == '0x' or not hex_data) else 50000 + (len(hex_data[2:]) // 2 * 16)
                
                # Calculate max cost using same formula
                max_gas_cost = (max_fee * gas_limit) / 10**18
                total_cost = amount + max_gas_cost

                # Show cost breakdown
                st.write("Estimated costs:")
                st.write(f"- Transaction value: {amount:.6f} ETH")
                st.write(f"- Maximum gas cost: {max_gas_cost:.6f} ETH")
                st.write(f"- Total required: {total_cost:.6f} ETH")
                
                if total_cost > balance:
                    st.warning(f"⚠️ Insufficient funds! Need {total_cost:.6f} ETH but have {balance:.6f} ETH")
                else:
                    st.success(f"✅ Sufficient funds available")

        except Exception as e:
            st.error(f"Error getting balance: {str(e)}")

    # Send transaction button
    if st.button("Send Transaction"):
        with st.spinner(f"Transferring ETH from {from_address} to {to_address}..."):
            try:
                receipt = asyncio.run(send_transaction(
                    amount_in_eth=amount,
                    to_address=to_address,
                    from_address=from_address,
                    store_id_private_key=store_id,
                    user_key_seed=user_key_seed,
                    data=data,
                    chain_id=chain_id,
                    priority_fee_gwei=priority_fee
                ))
                
                st.success(f"Transaction confirmed: [{receipt['transactionHash']}](https://sepolia.basescan.org/tx/{receipt['transactionHash']})")
                
                # Show transaction details
                with st.expander("Transaction Details"):
                    st.json(receipt)
                    
            except Exception as e:
                st.error(f"Error: {str(e)}") 