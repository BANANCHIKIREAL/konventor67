from flask import Flask, render_template, request, send_file, flash, redirect, url_for
from PIL import Image
import io
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
    if 'file' not in request.files:
        flash('No file selected')
        return redirect(url_for('index'))
    
    file = request.files['file']
    output_format = request.form.get('format')
    
    if file.filename == '':
        flash('No file selected')
        return redirect(url_for('index'))
    
    if file and allowed_file(file.filename) and output_format:
        try:
            # Open the image
            image = Image.open(file.stream)
            
            # Convert to RGB if necessary (for JPEG)
            if output_format.lower() == 'jpeg' and image.mode in ('RGBA', 'LA', 'P'):
                image = image.convert('RGB')
            
            # Save to memory buffer
            output_buffer = io.BytesIO()
            
            # Set appropriate format parameters
            save_kwargs = {}
            if output_format.lower() == 'jpeg':
                save_kwargs['quality'] = 95
            elif output_format.lower() == 'png':
                save_kwargs['optimize'] = True
            
            image.save(output_buffer, format=output_format.upper(), **save_kwargs)
            output_buffer.seek(0)
            
            # Create filename for download
            original_filename = secure_filename(file.filename)
            name_without_ext = os.path.splitext(original_filename)[0]
            output_filename = f"{name_without_ext}.{output_format.lower()}"
            
            return send_file(
                output_buffer,
                mimetype=f'image/{output_format.lower()}',
                as_attachment=True,
                download_name=output_filename
            )
            
        except Exception as e:
            flash(f'Error converting image: {str(e)}')
            return redirect(url_for('index'))
    else:
        flash('Invalid file or format selected')
        return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
