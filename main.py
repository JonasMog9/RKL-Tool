import math
from moralis import evm_api
import pandas as pd
from pandas import json_normalize
import json
import time
import warnings
import requests
from requests.exceptions import RequestException, Timeout

warnings.simplefilter(action='ignore', category=FutureWarning)
pd.options.mode.chained_assignment = None

api_key = "MYAPIKEY"

nftContract = "0xEf0182dc0574cd5874494a120750FD222FdB909a" ##RKL contract taken from etherscan
cursor = ""
df = pd.DataFrame()

firstParams = {
    "address": nftContract,
    "chain": "eth",
    "disable_total": False
}

def convert_ipfs_to_http(ipfs_url):
    if ipfs_url.startswith("ipfs://"):
        ipfs_hash = ipfs_url.split("ipfs://")[1]
        return f"https://ipfs.io/ipfs/{ipfs_hash}"
    return ipfs_url

# Define a function to get the image URL from the token URI
def get_image_url(token_uri):
    if pd.isna(token_uri):
        return None  # Skip if token_uri is NaN
    try:
        http_url = convert_ipfs_to_http(token_uri)
        response = requests.get(http_url, timeout=10)
        response.raise_for_status()
        metadata = response.json()
        return metadata.get('image')
    except Exception as e:
        print(f"Error with {token_uri}: {e}")
        return None
# Define the function to extract stats
def extract_stats(attributes):
    # Initialize default values for stats
    stats = {
        "Shooting": 0,
        "Defense": 0,
        "Vision": 0,
        "Finish": 0,
        "Total Boost": 0
    }
    # Extract stats from attributes
    for attribute in attributes:
        trait_type = attribute['trait_type']
        if trait_type in stats:
            stats[trait_type] = int(attribute['value'])

    # Calculate total boost
    stats['Total Boost'] = sum(stats[stat] for stat in stats if stat != 'Total Boost')

    return stats


#result = evm_api.nft.get_contract_nfts(
#    api_key=api_key,
#    params=firstParams
#)

#totalNFTs = 10000
#numOfReqs = 100

print("Fetching NFTs...")
while cursor is not None:
    result = evm_api.nft.get_contract_nfts(
        api_key=api_key,
        params={
            "address": nftContract,
            "chain": "eth",
            "cursor": cursor
        }
    )

    if 'cursor' in result:
        cursor = result["cursor"]
    else:
        cursor = None

    df2 = json_normalize(result["result"])
    print(f"Fetched {len(df2)} new rows. Total rows in df: {len(df)}")

    if df.empty:
        df = df2
    else:
        df = pd.concat([df, df2], ignore_index=True)

    time.sleep(0.21)  # Sleep to avoid hitting rate limits

    if cursor is None:
        print("No more data to fetch.")

print(f"Finished fetching. Total rows in df: {len(df)}")

# Create new columns in df for each stat and total boost
df['Shooting'] = 0
df['Defense'] = 0
df['Vision'] = 0
df['Finish'] = 0
df['Total Boost'] = 0

# Process each row to extract stats and calculate the total boost
for index, row in df.iterrows():
    
    metadata = json.loads(row['metadata']) if isinstance(row['metadata'], str) else row['metadata']
    attributes = metadata['attributes']
    stats = extract_stats(attributes)
    df.at[index, 'Shooting'] = stats['Shooting']
    df.at[index, 'Defense'] = stats['Defense']
    df.at[index, 'Vision'] = stats['Vision']
    df.at[index, 'Finish'] = stats['Finish']
    df.at[index, 'Total Boost'] = stats['Total Boost']




test_limit = 100 
df_test = df.head(test_limit)

df_test['Image URL'] = df_test['token_uri'].apply(get_image_url)



# Add a new column for image URLs
df['Image URL'] = df['token_uri'].apply(get_image_url)


columns_to_keep = ['token_id', 'Shooting', 'Defense', 'Vision', 'Finish', 'Total Boost', 'Image URL']
df_simplified = df[columns_to_keep]

# Save the simplified DataFrame to a new CSV file
df_simplified.to_csv('nft_stats_simplified_with_images.csv', index=False)

# Output the DataFrame to check
print(df_simplified.head())














