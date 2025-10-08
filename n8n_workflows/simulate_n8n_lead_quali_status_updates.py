import requests
import json

# API endpoints
status_url = "http://localhost:8888/.netlify/functions/lead-qualification-status-background"
runid_url = "http://localhost:8888/.netlify/functions/get-latest-runid"
# Production: https://www.symbolicenterprises.com/.netlify/functions/lead-qualification-status-background

# Headers
headers = {
    "Content-Type": "application/json",
    "x-api-key": "symbo0l!cai^123@z"
    # "Authorization": "Bearer e73f3b21-b6d6-4848-9f6f-956ded7f70ab"
}

# Function to get the latest runId from the server
def get_latest_runid():
    try:
        response = requests.get(runid_url)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                return data.get('runId')
        print(f"Failed to get runId: {response.status_code} - {response.text}")
        return None
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return None

# Function to create status updates with the latest runId
def create_status_updates(run_id):
    return [
        {
            "runId": run_id,
            "status": "Form submission received",
            "statusMessage": "Commencing company research..."
        },
        {
            "runId": run_id,
            "status": "Researching company",
            "statusMessage": "Analyzing company website and business model..."
        },
        {
            "runId": run_id,
            "status": "Calling lead",
            "statusMessage": "Attempting to contact the lead via phone..."
        },
        {
            "runId": run_id,
            "status": "Call completed",
            "statusMessage": "Lead successfully contacted and qualified",
            "qualified": True,
            "output": "Lead is interested in AI automation services. Budget: $50k-100k. Timeline: Q2 2025.",
            "callSummary": "15-minute call with decision maker. High interest in workflow automation.",
            "callNotes": "Company has 50+ employees, manual processes causing bottlenecks. Ready to move forward with pilot project."
        },
        {
            "runId": run_id,
            "status": "Done",
            "statusMessage": "Database updated. Lead QualificationProcessing completed.",
            "qualified": True,
        }
    ]

# Function to send status update
def send_status_update(data):
    try:
        response = requests.post(status_url, headers=headers, json=data)
        
        # Print response details
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.text}")
        
        # If response is JSON, pretty print it
        try:
            json_response = response.json()
            print(f"JSON Response: {json.dumps(json_response, indent=2)}")
        except json.JSONDecodeError:
            print("Response is not JSON")
            
        return response.status_code in [200, 202]
        
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return False

# Get the latest runId and send status updates
print("Getting latest runId from server...")
latest_run_id = get_latest_runid()

if not latest_run_id:
    print("ERROR: No runId found. Please submit the lead qualification form first.")
    exit(1)

print(f"Found latest runId: {latest_run_id}")
print("Creating status updates...")
status_updates = create_status_updates(latest_run_id)

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
        time.sleep(4)
