document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseBtn');
    const previewContainer = document.getElementById('previewContainer');
    const previewImage = document.getElementById('previewImage');
    const fileName = document.getElementById('fileName');
    const convertForm = document.getElementById('convertForm');
    const convertBtn = document.getElementById('convertBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');

    // File input handlers
    browseBtn.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop handlers
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            handleFileSelect({ target: { files } });
        }
    });

    // Format selection handlers
    const formatOptions = document.querySelectorAll('input[name="format"]');
    formatOptions.forEach(option => {
        option.addEventListener('change', checkFormValidity);
    });

    // Form submission
    convertForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            showLoading();
            
            // Create form data for AJAX submission
            const formData = new FormData(convertForm);
            
            fetch('/convert', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (response.ok) {
                    return response.blob();
                } else {
                    throw new Error('Conversion failed');
                }
            })
            .then(blob => {
                // Get filename from response or create one
                const originalFile = fileInput.files[0];
                const format = document.querySelector('input[name="format"]:checked').value;
                const nameWithoutExt = originalFile.name.split('.').slice(0, -1).join('.');
                const filename = `${nameWithoutExt}.${format}`;
                
                // Create download link
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                // Hide loading and reset form
                hideLoading();
                resetForm();
                
                // Show success message
                showSuccessMessage('Изображение успешно конвертировано!');
            })
            .catch(error => {
                console.error('Error:', error);
                hideLoading();
                alert('Ошибка при конвертации изображения');
            });
        }
    });

    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                fileName.textContent = file.name;
                previewContainer.classList.remove('hidden');
                checkFormValidity();
            };
            
            reader.readAsDataURL(file);
        } else {
            resetPreview();
        }
    }

    function checkFormValidity() {
        const fileSelected = fileInput.files.length > 0;
        const formatSelected = document.querySelector('input[name="format"]:checked') !== null;
        
        convertBtn.disabled = !(fileSelected && formatSelected);
    }

    function validateForm() {
        const file = fileInput.files[0];
        const format = document.querySelector('input[name="format"]:checked');
        
        if (!file) {
            alert('Пожалуйста, выберите файл');
            return false;
        }
        
        if (!format) {
            alert('Пожалуйста, выберите формат для конвертации');
            return false;
        }
        
        // Check file size (16MB max)
        if (file.size > 16 * 1024 * 1024) {
            alert('Размер файла не должен превышать 16MB');
            return false;
        }
        
        return true;
    }

    function showLoading() {
        convertBtn.style.display = 'none';
        loadingSpinner.classList.remove('hidden');
    }

    function hideLoading() {
        convertBtn.style.display = 'inline-flex';
        loadingSpinner.classList.add('hidden');
    }

    function resetForm() {
        fileInput.value = '';
        resetPreview();
        
        // Reset format selection
        const formatOptions = document.querySelectorAll('input[name="format"]');
        formatOptions.forEach(option => {
            option.checked = false;
        });
        
        checkFormValidity();
    }

    function showSuccessMessage(message) {
        // Create success alert
        const successDiv = document.createElement('div');
        successDiv.className = 'bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 mt-4';
        successDiv.textContent = message;
        
        // Insert after form
        convertForm.parentNode.insertBefore(successDiv, convertForm.nextSibling);
        
        // Remove after 3 seconds
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }

    function resetPreview() {
        previewContainer.classList.add('hidden');
        previewImage.src = '';
        fileName.textContent = '';
        convertBtn.disabled = true;
    }

    // Initialize
    checkFormValidity();
});
