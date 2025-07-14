import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

# --- CONFIGURATION ---
INPUT_HTML = 'index_russian.html'
OUTPUT_HTML = 'index_local.html'
ASSET_DIRS = {
    'images': 'images',
    'css': 'css',
    'js': 'js',
}
# URLs from these domains will not be downloaded as they are dynamic services
# or external tools that won't work locally.
SKIP_DOMAINS = [
    'prod.spline.design',         # Dynamic 3D content, must be loaded from their server
    'me.kis.v2.scr.kaspersky-labs.com', # External antivirus script, not part of the site
    'ajax.googleapis.com',        # Google Fonts loader, best left to work online
    'fonts.googleapis.com',       # Google Fonts service
    'fonts.gstatic.com',          # Google Fonts service
]

def create_directories():
    """Create local directories for assets if they don't exist."""
    for directory in ASSET_DIRS.values():
        os.makedirs(directory, exist_ok=True)
    print("Created asset directories: images/, css/, js/")

def get_filename_from_url(url):
    """Extracts a clean filename from a URL."""
    parsed_path = urlparse(url).path
    # Take the last part of the path and clean it
    filename = os.path.basename(parsed_path)
    if not filename:
        # Fallback for URLs ending in '/'
        filename = parsed_path.strip('/').split('/')[-1] + '.html'
    return filename

def download_asset(url, base_url=""):
    """Downloads a single asset from a URL and saves it to the correct directory."""
    if not url:
        return None, None

    # Handle protocol-relative URLs (e.g., //example.com/file.js)
    if url.startswith('//'):
        url = 'https:' + url

    # Skip empty, data, or anchor links
    if url.startswith(('data:', '#', 'javascript:')):
        return None, None

    # Resolve relative URLs
    full_url = urljoin(base_url, url)
    
    # Skip domains that should not be localized
    if any(skip_domain in full_url for skip_domain in SKIP_DOMAINS):
        print(f"--> Skipping non-localizable URL: {full_url}")
        return None, url # Return the original URL

    try:
        # Determine asset type and folder
        if full_url.endswith(('.css')):
            folder = ASSET_DIRS['css']
        elif full_url.endswith(('.js')):
            folder = ASSET_DIRS['js']
        elif full_url.endswith(('.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp')):
            folder = ASSET_DIRS['images']
        else:
            # A fallback for unknown image types or file-less URLs
            folder = ASSET_DIRS['images']
        
        filename = get_filename_from_url(full_url)
        local_path = os.path.join(folder, filename)

        if not os.path.exists(local_path):
            print(f"Downloading: {full_url} -> {local_path}")
            response = requests.get(full_url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=15)
            response.raise_for_status() # Raise an exception for bad status codes
            with open(local_path, 'wb') as f:
                f.write(response.content)
        else:
            print(f"Already exists: {local_path}")

        return local_path.replace('\\', '/'), full_url
    except requests.exceptions.RequestException as e:
        print(f"!!! Error downloading {full_url}: {e}")
        return None, full_url # Return original URL on failure

def main():
    """Main function to process HTML and download assets."""
    create_directories()

    try:
        with open(INPUT_HTML, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f, 'html.parser')
    except FileNotFoundError:
        print(f"Error: Input file '{INPUT_HTML}' not found. Please save the Russian HTML file in the same directory.")
        return

    # Find and remove the Kaspersky script
    kaspersky_script = soup.find('script', src=lambda s: s and 'kaspersky-labs.com' in s)
    if kaspersky_script:
        kaspersky_script.decompose()
        print("Removed Kaspersky antivirus script.")

    # Process all relevant tags and attributes
    tags_to_process = {
        'link': 'href',
        'script': 'src',
        'img': 'src',
    }
    
    for tag_name, attr in tags_to_process.items():
        for tag in soup.find_all(tag_name, **{attr: True}):
            original_url = tag[attr]
            local_path, _ = download_asset(original_url)
            if local_path:
                tag[attr] = local_path
    
    # Special handling for <img> srcset attribute
    for tag in soup.find_all('img', srcset=True):
        original_srcset = tag['srcset']
        new_srcset_parts = []
        for part in original_srcset.split(','):
            part = part.strip()
            if not part:
                continue
            
            url_part, *descriptor_part = part.split(' ', 1)
            descriptor = descriptor_part[0] if descriptor_part else ''
            
            local_path, _ = download_asset(url_part)
            if local_path:
                new_srcset_parts.append(f"{local_path} {descriptor}")
            else:
                new_srcset_parts.append(part) # Keep original if download failed/skipped
        
        tag['srcset'] = ', '.join(new_srcset_parts)

    # Save the modified HTML
    with open(OUTPUT_HTML, 'w', encoding='utf-8') as f:
        f.write(str(soup.prettify()))

    print(f"\nProcessing complete!")
    print(f"A new file '{OUTPUT_HTML}' has been created with local paths.")
    print("You can now open it in your browser to view the site offline.")

if __name__ == '__main__':
    main()