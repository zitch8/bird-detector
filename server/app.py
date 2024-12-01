from inference_sdk import InferenceHTTPClient
from flask import Flask, Response, render_template, request, jsonify
import json
import base64

key = "api_key.json"

# Open and load the JSON file
with open(key, "r") as file:
    data = json.load(file)

# Extract the API key
api = data.get("api_key")

client = InferenceHTTPClient(
    api_url="https://detect.roboflow.com",
    api_key=api
)

app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True

@app.route('/', methods=['POST', 'GET'])
def classify():
    file = request.files['image']
    if file:
        file_bytes = file.read()
        encoded_image = base64.b64encode(file_bytes).decode('utf-8')
        result = client.run_workflow(
            workspace_name="birdclassification-ipixp",
            workflow_id="custom-workflow",
            images={
                "image": encoded_image
            }
        )
        five_predictions = result[0]['model_predictions']['predictions']['predictions'][:5]
        return jsonify(five_predictions)
    
app.route('/index', methods=['POST', 'GET'])
def index():
    return render_template("index.html")


if __name__ == '__main__':
    app.run(debug=True, port=8080)

# Get Workflow


