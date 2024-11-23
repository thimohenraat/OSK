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
        # Gebruik request.form om gegevens op te halen
        query_str = request.form.get("query")  # Verkrijg de zoekterm
        file_types = request.form.get("file_types", "").strip()  # Bestandstypen ophalen als lijst
        search_location = request.form.get("search_location", None)  # Zoeklocatie ophalen

        # Als geen bestandstypen zijn opgegeven, stel alle ondersteunde extensies in
        if not file_types:
            file_types = ['.pdf', '.docx', '.pptx', '.xlsx']  # Voeg meer bestandstypen toe indien nodig
        else:
            file_types = file_types.split(',')

        if not search_location:
            print("No search location provided")
            return jsonify({"error": "Geen zoeklocatie opgegeven"}), 400
        
        if not os.path.exists(search_location):
            print(f"Location does not exist: {search_location}")
            return jsonify({"error": f"Locatie niet gevonden: {search_location}"}), 400
        
        try:
            results_data = search_files(query_str, file_types, search_location)
            return jsonify(results_data)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    except Exception as e:
        print(f"Unexpected error in search: {e}")
        return jsonify({"error": str(e)}), 500
    
@app.route('/open-file-location', methods=['POST'])
def open_file_location_route():
    data = request.json
    return open_file_location(data)

@app.route('/open-file', methods=['POST'])
def open_file_route():
    data = request.json
    return open_file(data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000, debug=True)  # Zorg voor deze configuratie