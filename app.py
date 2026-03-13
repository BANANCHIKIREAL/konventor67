from flask import Flask, render_template, request, send_file, flash, redirect, url_for
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

ALLOWED_EXTENSIONS = {
    'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'tif', 'webp', 'ico', 'cur',
    'ppm', 'pgm', 'pbm', 'pnm', 'psd', 'eps', 'pdf', 'svg', 'tga', 
    'jp2', 'j2k', 'jpf', 'jpx', 'pcx', 'dib', 'fpx', 'iff', 'lbm', 
    'sgi', 'rgb', 'rgba', 'bw', 'ras', 'sun', 'xbm', 'xpm', 'im', 
    'msp', 'pcd', 'cut', 'gbr', 'pat', 'pct', 'pic', 'pict', 
    'png', 'pns', 'psp', 'pxr', 'sct', 'tga', 'tif', 'wmf', 'emf'
}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/convert', methods=['POST'])
def convert_image():
    flash('Image conversion temporarily disabled for deployment')
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
