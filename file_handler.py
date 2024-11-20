import os
import platform
import subprocess
import logging

def open_file_location(data):
    filepath = data.get('filepath')
    
    if filepath:
        try:
            if platform.system() == "Windows":
                os.startfile(os.path.dirname(filepath))
            elif platform.system() == "Darwin":  # macOS
                subprocess.Popen(["open", os.path.dirname(filepath)])
            else:  # Linux
                subprocess.Popen(["xdg-open", os.path.dirname(filepath)])
            return {"success": True}
        except Exception as e:
            logging.error(f"Error opening file location: {e}")
            return {"success": False, "error": str(e)}
    else:
        return {"success": False, "error": "No filepath provided"}

def open_file(data):
    filepath = data.get('filepath')
    
    if filepath:
        try:
            if platform.system() == "Windows":
                os.startfile(filepath)
            elif platform.system() == "Darwin":  # macOS
                subprocess.call(('open', filepath))
            else:  # Linux
                subprocess.call(('xdg-open', filepath))
            return {"success": True, "message": "File opened"}
        except Exception as e:
            logging.error(f"Error opening file: {e}")
            return {"success": False, "error": str(e)}
    else:
        return {"success": False, "error": "No filepath provided"}