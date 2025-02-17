import os
import shutil
import site
from bs4 import BeautifulSoup

# Get site-packages directory dynamically
site_packages = site.getsitepackages()[0]
streamlit_path = os.path.join(site_packages, 'streamlit/static/index.html')

# Create a backup of the original index.html
shutil.copy2(streamlit_path, streamlit_path + '.bak')

# Read the original index.html
with open(streamlit_path, 'r') as file:
    html_content = file.read()

# Parse the HTML
soup = BeautifulSoup(html_content, 'html.parser')

meta_tags = [
    {'name': 'title', 'content': 'Nillion Signature Tools'},
    {'name': 'description', 'content': 'Nillion Signature Tools - Explore tools that use Nillion for private key storage and threshold ECDSA signing'},
    {'name': 'keywords', 'content': 'Nillion, ECDSA, threshold signing, private key storage, blockchain, cryptography, web3'},
    {'name': 'author', 'content': 'oceans404'},
    {'name': 'robots', 'content': 'index, follow'},
    {'name': 'viewport', 'content': 'width=device-width, initial-scale=1'},
    {'property': 'og:type', 'content': 'website'},
    {'property': 'og:url', 'content': 'https://nillion-signature-tools.streamlit.app'},
    {'property': 'og:title', 'content': 'Nillion Signature Tools'},
    {'property': 'og:description', 'content': 'Explore tools that use Nillion for private key storage and threshold ECDSA signing'},
    {'property': 'og:image', 'content': 'https://raw.githubusercontent.com/oceans404/nillion-signature-tools/main/Nillion%20Signature%20Tools.jpg'},
    {'name': 'twitter:card', 'content': 'summary_large_image'},
    {'name': 'twitter:url', 'content': 'https://nillion-signature-tools.streamlit.app'},
    {'name': 'twitter:title', 'content': 'Nillion Signature Tools'},
    {'name': 'twitter:description', 'content': 'Explore tools that use Nillion for private key storage and threshold ECDSA signing'},
    {'name': 'twitter:image', 'content': 'https://raw.githubusercontent.com/oceans404/nillion-signature-tools/main/Nillion%20Signature%20Tools.jpg'},
    {'name': 'application-name', 'content': 'Nillion Signature Tools'},
]

for tag in meta_tags:
    new_tag = soup.new_tag('meta')
    for key, value in tag.items():
        new_tag[key] = value
    soup.head.append(new_tag)

with open(streamlit_path, 'w') as file:
    file.write(str(soup))

print("Meta tags have been added to the Streamlit index.html file.")