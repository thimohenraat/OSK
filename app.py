from flask import Flask, request, jsonify, render_template
from indexer import create_index
from search_file import search_files
from file_structure import build_file_structure
from file_handler import open_file_location, open_file
from whoosh.index import open_dir
from whoosh.qparser import QueryParser
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
    
@app.route('/check-index', methods=['POST'])
def check_index():
    data = request.json
    location = data.get("location")
    if not location:
        return jsonify({"indexed": False, "error": "Geen locatie opgegeven"}), 400
    
    index_dir = "indexdir"
    if not os.path.exists(index_dir):
        return jsonify({"indexed": False})
    
    with open_dir(index_dir).searcher() as searcher:
        parser = QueryParser("path", schema=searcher.schema)
        query = parser.parse(f"path:{location}*")
        result = searcher.search(query, limit=1)
        return jsonify({"indexed": len(result) > 0})

@app.route('/search', methods=['POST'])
def search():
    try:
        query = request.form.get("query")
        file_types = request.form.get("file_types", "").strip().split(',')
        search_location = request.form.get("search_location")
        search_type = request.form.get("search_type")

        if not file_types or file_types == ['']:
            file_types = ['.pdf', '.docx', '.pptx', '.xlsx']

        if not search_location:
            return jsonify({"error": "No search location provided"}), 400

        if not os.path.exists(search_location):
            return jsonify({"error": f"Location not found: {search_location}"}), 400

        try:
            results = search_files(query, file_types, search_location, search_type)
            file_structure = build_file_structure(search_location)

            return jsonify({
                "results": results,
                "file_structure": file_structure
            })
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