import os
import platform
import subprocess
import logging

def open_file_location(data):
    filepath = data.get('filepath')
    
    if filepath:
        try:
            directory = os.path.dirname(filepath)
            if platform.system() == "Windows":
                os.startfile(directory)
            elif platform.system() == "Darwin":  # macOS
                subprocess.Popen(["open", directory])
            else:  # Linux
                subprocess.Popen(["xdg-open", directory])
            return {"success": True}
        except Exception as e:
            logging.error(f"Error opening file location: {e}")
            return {"success": False, "error": str(e)}
    else:
        return {"success": False, "error": "No file path provided"}

def open_file(data):
    """Opens a file using the default system application."""
    filepath = data.get('filepath')

    if not filepath:
        return {"success": False, "error": "No filepath provided"}

    try:
        if platform.system() == "Windows":
            os.startfile(filepath)
        elif platform.system() == "Darwin":  # macOS
            subprocess.call(("open", filepath))
        else:  # Linux
            subprocess.call(("xdg-open", filepath))
        return {"success": True, "message": "File opened"}
    except Exception as e:
        return {"success": False, "error": str(e)}
