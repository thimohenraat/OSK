import os

def build_file_structure(root_dir):
    structure = {}
    for root, dirs, files in os.walk(root_dir):
        current = structure
        path = os.path.relpath(root, root_dir).split(os.sep)
        for part in path:
            if part not in current:
                current[part] = {}
            current = current[part]
        for file in files:
            if file.lower() != 'thumbs.db':  
                current[file] = None
    return structure