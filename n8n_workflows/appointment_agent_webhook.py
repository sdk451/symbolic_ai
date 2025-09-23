import requests
import json

# API endpoint
url = "https://n8n.srv995431.hstgr.cloud/webhook-test/symbolicai-booking"
# https://turingconsulting.app.n8n.cloud/webhook-test/edb03abc-8dd5-4d6a-b92f-3f9a07e8b8d4

# Headers
headers = {
    "Content-Type": "application/json",
    "x-api-key": "t&st45@1z"
    # "Authorization": "Bearer e73f3b21-b6d6-4848-9f6f-956ded7f70ab"
}

# Request body
data = {
  "message" : {
    "category": "new_booking",
    "name": "Simon Kaufmann",
    "email": "Simon dot Kaufmann at Gmail dot com",
    "day": "Tomorrow",
    "time": "4 PM"
  }
}

# Make the POST request
try:
    response = requests.post(url, headers=headers, json=data)
    
    # Print response details
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print(f"Response Body: {response.text}")
    
    # If response is JSON, pretty print it
    try:
        json_response = response.json()
        print(f"JSON Response: {json.dumps(json_response, indent=2)}")
    except json.JSONDecodeError:
        print("Response is not JSON")
        
except requests.exceptions.RequestException as e:
    print(f"Request failed: {e}")
