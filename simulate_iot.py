import json
import random
import time
import hashlib
from web3 import Web3

# === Configuration Variables ===
LOCAL_NODE = 'https://eth-sepolia.g.alchemy.com/v2/IczRrCI0W7PLoMNcIDR24fOrz4fLq19H'
# Path to the compiled artifact of the SupplyChainLifecycle contract.
SCL_ARTIFACT_PATH = './appfrontend/src/contracts/SupplyChainLifecycle.json'
# Deployed address of your SupplyChainLifecycle contract.
SCL_CONTRACT_ADDRESS = Web3.to_checksum_address('0x00899f961bb3B328b03F38524B164A1021D0e2fC')
# Private key from an account registered as a Producer.
PRIVATE_KEY = 'eb189de39ad0e4faf3e7671b82337a9a95e8ad97b65c57facc8b35245f930561'

# === Connect to Blockchain ===
web3 = Web3(Web3.HTTPProvider(LOCAL_NODE))
if not web3.is_connected():
    raise Exception("Failed to connect to the local blockchain.")
print("Connected to blockchain at", LOCAL_NODE)

# === Load SupplyChainLifecycle Contract ABI ===
with open(SCL_ARTIFACT_PATH, 'r') as file:
    contract_json = json.load(file)
contract_abi = contract_json['abi']
scl_contract = web3.eth.contract(address=SCL_CONTRACT_ADDRESS, abi=contract_abi)

# Prepare the Producer account
account = web3.eth.account.from_key(PRIVATE_KEY)
print("Using Producer account:", account.address)

# Simulate IoT Authenticity Data
def simulate_authenticity_data():
    # Generate IoT authenticity data
    iot_tag_id = "TAG-" + str(random.randint(1000, 9999))
    sample_data = str(random.random()).encode()
    digital_fingerprint = Web3.to_hex(hashlib.sha256(sample_data).digest())
    location = f"Lat:{random.uniform(-90, 90):.4f}, Long:{random.uniform(-180, 180):.4f}"
    authenticity_timestamp = int(time.time())
    metadata = f"Temp: {random.randint(20, 35)}°C, Humidity: {random.randint(40, 80)}%"
    return iot_tag_id, digital_fingerprint, location, authenticity_timestamp, metadata

iot_tag_id, digital_fingerprint, location, authenticity_timestamp, metadata = simulate_authenticity_data()
print("Simulated Authenticity Data:")
print("IoT Tag ID:", iot_tag_id)
print("Digital Fingerprint:", digital_fingerprint)
print("Location:", location)
print("Timestamp:", authenticity_timestamp)
print("Metadata:", metadata)

# Build product details
prod_name = "Batch with IoT Auth"
# Standard product description
base_prod_desc = "Auto-created batch with standard details."
# Append authenticity info to the product description
auth_details = f" | IoT Data: [Tag: {iot_tag_id}, Fingerprint: {digital_fingerprint}, Location: {location}, Timestamp: {authenticity_timestamp}, Metadata: {metadata}]"
full_prod_desc = base_prod_desc + auth_details

# Other product details
prod_price = 10000
prod_qty = 50
producer_add = account.address

# Build and send the transaction to produce the batch using the existing produceProduct function
nonce = web3.eth.get_transaction_count(account.address)
chain_id = web3.eth.chain_id

txn = scl_contract.functions.produceProduct(
    prod_name,
    full_prod_desc,
    prod_price,
    prod_qty,
    producer_add
).build_transaction({
    'chainId': chain_id,
    'gas': 500000,  # increased gas limit
    'gasPrice': web3.to_wei('50', 'gwei'),
    'nonce': nonce,
})


signed_txn = web3.eth.account.sign_transaction(txn, private_key=PRIVATE_KEY)
print("Sending transaction to produce a batch with appended authenticity data...")
txn_hash = web3.eth.send_raw_transaction(signed_txn.rawTransaction)
print("Transaction sent. Hash:", txn_hash.hex())

txn_receipt = web3.eth.wait_for_transaction_receipt(txn_hash)
print("Transaction mined. Receipt:", txn_receipt)

# Optionally, parse logs to get the new product ID from the Produced event
for log_entry in txn_receipt.logs:
    try:
        parsed_log = scl_contract.events.Produced().process_log(log_entry)
        new_product_id = parsed_log.args.productID
        print("New Product ID created:", new_product_id)
    except Exception as e:
        pass
