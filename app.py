from flask import Flask, request, jsonify, render_template
from indexer import create_index
from search import search_files
from file_handler import open_file_location, open_file
import os

app = Flask(__name__, template_folder='templates', static_folder='static')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/index', methods=['POST'])
def index_route():
    location = request.form.get("location")
    if not location:
        return jsonify({"success": False, "error": "Geen locatie opgegeven"}), 400

    success = create_index(location)
    if success:
        return jsonify({"success": True, "message": f"Bestanden in {location} zijn geïndexeerd."})
    else:
        return jsonify({"success": False, "error": f"Kon bestanden in {location} niet indexeren."}), 500

@app.route('/search', methods=['POST'])
def search():
    try:
        query = request.form.get("query")
        file_types = request.form.get("file_types", "").strip().split(',')
        search_location = request.form.get("search_location")

        if not file_types or file_types == ['']:
            file_types = ['.pdf', '.docx', '.pptx', '.xlsx']

        if not search_location:
            return jsonify({"error": "No search location provided"}), 400

        if not os.path.exists(search_location):
            return jsonify({"error": f"Location not found: {search_location}"}), 400

        try:
            results = search_files(query, file_types, search_location)
            return jsonify(results)
        except Exception as error:
            return jsonify({"error": str(error)}), 500

    except Exception as error:
        return jsonify({"error": str(error)}), 500
    
@app.route('/open-file-location', methods=['POST'])
def open_file_location_route():
    data = request.json
    return open_file_location(data)

@app.route('/open-file', methods=['POST'])
def open_file_route():
    data = request.json
    return open_file(data)

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)