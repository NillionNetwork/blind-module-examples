from typing import Dict, Optional
from dataclasses import dataclass
import os
from dotenv import load_dotenv

load_dotenv()

current_nillion_network = os.getenv("NILLION_NETWORK_CONFIG", "Devnet")
user_key_seed = os.getenv("NILLION_USER_KEY_SEED", "demo")
nilchain_private_key = os.getenv("NILLION_NILCHAIN_PRIVATE_KEY")

@dataclass
class NetworkConfig:
    NILLION_NILCHAIN_CHAIN_ID: str
    NILLION_NILCHAIN_GRPC: str
    NILLION_NILVM_GRPC_ENDPOINT: str
    
class Config:
    NETWORK_CONFIGS: Dict[str, NetworkConfig] = {
        "Devnet": NetworkConfig(
            NILLION_NILCHAIN_CHAIN_ID="nillion-chain-devnet",
            NILLION_NILCHAIN_GRPC="http://localhost:26649",
            NILLION_NILVM_GRPC_ENDPOINT="http://127.0.0.1:37939",
        ),
        # https://docs.nillion.com/network
        "Testnet": NetworkConfig(
            NILLION_NILCHAIN_CHAIN_ID="nillion-chain-testnet-1",
            NILLION_NILCHAIN_GRPC="https://testnet-nillion-grpc.lavenderfive.com",
            NILLION_NILVM_GRPC_ENDPOINT="https://node-1.nilvm-testnet-1.nillion-network.testnet.nillion.network:14311",
        ),
    }
        
full_config = Config()
config = full_config.NETWORK_CONFIGS[current_nillion_network]
config.NILLION_NETWORK_CONFIG = current_nillion_network
config.NILLION_USER_KEY_SEED = user_key_seed
config.NILLION_NILCHAIN_PRIVATE_KEY = nilchain_private_key