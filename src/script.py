import requests
from bs4 import BeautifulSoup

# URL of the website
url = "https://www.carinfo.app/rc-details/TN19AC4044"

# Send a GET request to the URL
response = requests.get(url)

# Parse the HTML content
soup = BeautifulSoup(response.text, "html.parser")

# Find the element containing owner name
owner_name_element = soup.find("p", text="Owner Name")

# Find the sibling element containing the actual owner name
owner_name = owner_name_element.find_next_sibling("p").text.strip()

# Find the element containing registered RTO
registered_rto_element = soup.find("p", text="Registered RTO")

# Find the sibling element containing the actual registered RTO
registered_rto = registered_rto_element.find_next_sibling("p").text.strip()

# Print the extracted information
print("Owner Name:", owner_name)
print("Registered RTO:", registered_rto)
