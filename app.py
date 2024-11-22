from flask import Flask, request, jsonify, render_template
from indexer import create_index
from search import search_files
from file_handler import open_file_location, open_file

app = Flask(__name__, template_folder='templates', static_folder='static')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search():
    query_str = request.form.get("query")
    file_types = request.form.get("file_types", [])
    
    results_data = search_files(query_str, file_types)
    return jsonify(results_data)

@app.route('/open-file-location', methods=['POST'])
def open_file_location_route():
    data = request.json
    return open_file_location(data)

@app.route('/open-file', methods=['POST'])
def open_file_route():
    data = request.json
    return open_file(data)

if __name__ == '__main__':
    root_dir = 'documents'
    create_index(root_dir)
    app.run(debug=True)
