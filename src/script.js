document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);
document.getElementById('uploadForm').addEventListener('submit', uploadImage, false);

async function handleFileSelect(event) {
    const files = event.target.files;
    const imageGrid = document.getElementById('imageGrid');
    imageGrid.innerHTML = ''; // Clear existing images

    const imageFiles = [];

    for (const file of files) {
        if (file.type.startsWith('image/')) {
            imageFiles.push(file);
        }
    }

    for (const file of imageFiles) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            imageGrid.appendChild(img);
        };
        reader.readAsDataURL(file);
    }
}

async function uploadImage(event) {
    event.preventDefault();
    const fileInput = document.getElementById('uploadInput');
    const file = fileInput.files[0];

    if (!file || !file.type.startsWith('image/')) {
        alert('Please select an image file to upload.');
        return;
    }

    const reader = new FileReader();
    reader.onload = async function(e) {
        const content = e.target.result.split(',')[1];
        const path = `images/${file.name}`;
        const message = `Add ${file.name}`;
        const repo = 'slowafk/image-metadata-ui';
        const branch = 'main';
        const token = 'your-github-token-here'; // Replace with your GitHub token

        const response = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                content: content,
                branch: branch
            })
        });

        if (response.ok) {
            alert('Image uploaded successfully!');
            fileInput.value = ''; // Clear the file input
        } else {
            const error = await response.json();
            alert(`Failed to upload image: ${error.message}`);
        }
    };

    reader.readAsDataURL(file);
}
