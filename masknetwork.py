import requests

# Define the API endpoint and the identity parameter
api_url = "https://api.web3.bio/profile/"
identity = "vitalik.eth"  # Replace with the identity you want to query


def getETHAddressUsingMask(identity):
    # Make the GET request
    try:
        response = requests.get(f"{api_url}{identity}")

        # Check if the request was successful
        if response.status_code == 200:
            data = response.json()
            print(data)  # You can process the data here
            return data[0]["address"]
        else:
            print(f"Request failed with status code {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"Request failed with error: {e}")
