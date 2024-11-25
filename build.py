import PyInstaller.__main__
import sys

def build():
    args = [
        'app.py',
        '--onefile',
        '--windowed',
        '--name', 'FileSearch',
        '--icon', 'icon.ico',  # Add an icon if you have one
        '--add-data', 'templates:templates',  # If you have template files
        '--add-data', 'static:static',  # Voor statische bestanden
        '--hidden-import', 'clr',
        '--hidden-import', 'webview.platforms.winforms'
    ]
    
    PyInstaller.__main__.run(args)

if __name__ == '__main__':
    build()