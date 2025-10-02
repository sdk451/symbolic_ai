import requests
import json

# API endpoint
url = "http://localhost:8888/.netlify/functions/lead-qualification-status"
# Production: https://www.symbolicenterprises.com/.netlify/functions/lead-qualification-status

# Headers
headers = {
    "Content-Type": "application/json",
    "x-api-key": "symbo0l!cai^123@z"
    # "Authorization": "Bearer e73f3b21-b6d6-4848-9f6f-956ded7f70ab"
}

# Example status updates to simulate the full workflow
status_updates = [
    {
        "runId": "lq_1759358229571_ri4ksurhp",
        "status": "Form submission received",
        "statusMessage": "Commencing company research..."
    },
    {
        "runId": "lq_1759358229571_ri4ksurhp",
        "status": "Researching company",
        "statusMessage": "Analyzing company website and business model..."
    },
    {
        "runId": "lq_1759358229571_ri4ksurhp",
        "status": "Calling lead",
        "statusMessage": "Attempting to contact the lead via phone..."
    },
    {
        "runId": "lq_1759358229571_ri4ksurhp",
        "status": "Call completed",
        "statusMessage": "Lead successfully contacted and qualified",
        "qualified": True,
        "output": "Lead is interested in AI automation services. Budget: $50k-100k. Timeline: Q2 2025.",
        "callSummary": "15-minute call with decision maker. High interest in workflow automation.",
        "callNotes": "Company has 50+ employees, manual processes causing bottlenecks. Ready to move forward with pilot project."
    }
]

# Function to send status update
def send_status_update(data):
    try:
        response = requests.post(url, headers=headers, json=data)
        
        # Print response details
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.text}")
        
        # If response is JSON, pretty print it
        try:
            json_response = response.json()
            print(f"JSON Response: {json.dumps(json_response, indent=2)}")
        except json.JSONDecodeError:
            print("Response is not JSON")
            
        return response.status_code == 200
        
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return False

# Send all status updates
print("Sending status updates...")
for i, update in enumerate(status_updates):
    print(f"\n--- Status Update {i+1} ---")
    print(f"Sending: {update['status']} - {update['statusMessage']}")
    success = send_status_update(update)
    if success:
        print("[SUCCESS]")
    else:
        print("[FAILED]")
    
    # Add delay between updates to simulate real workflow timing
    if i < len(status_updates) - 1:
        import time
        time.sleep(2)
