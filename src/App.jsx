import React, { useState, useCallback } from 'react';
import { Upload, X, Plus, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';

const ImageUploadWithMetadata = () => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const extractMetadataTags = (file) => {
    // Extract tags from filename
    const filenameWithoutExt = file.name.split('.')[0];
    const potentialTags = filenameWithoutExt
      .replace(/[-_]/g, ' ')  // Replace dashes and underscores with spaces
      .split(' ')
      .filter(tag => tag.length > 2)  // Only keep tags with 3+ characters
      .map(tag => tag.toLowerCase());

    // Extract tags from file type
    const formatTag = file.type.split('/')[1].toLowerCase();
    
    // Extract tags from date
    const dateObj = new Date(file.lastModified);
    const monthTag = dateObj.toLocaleString('default', { month: 'long' }).toLowerCase();
    const yearTag = dateObj.getFullYear().toString();
    
    // Extract size-based tags
    const sizeInMB = file.size / (1024 * 1024);
    let sizeTag;
    if (sizeInMB < 1) sizeTag = 'small-file';
    else if (sizeInMB < 5) sizeTag = 'medium-file';
    else sizeTag = 'large-file';

    // Combine all tags and remove duplicates
    const allTags = [...new Set([
      ...potentialTags,
      formatTag,
      monthTag,
      yearTag,
      sizeTag
    ])];

    return allTags;
  };

  const processImage = async (file) => {
    return new Promise((resolve) => {
      const imageUrl = URL.createObjectURL(file);
      const img = new Image();
      
      img.onload = () => {
        // Extract dimensions-based tags
        const dimensionTags = [];
        if (img.width > img.height) dimensionTags.push('landscape');
        else if (img.height > img.width) dimensionTags.push('portrait');
        if (img.width >= 3000 || img.height >= 3000) dimensionTags.push('high-resolution');

        // Extract all metadata
        const extractedTags = extractMetadataTags(file);
        
        const metadata = {
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
          type: file.type,
          dimensions: `${img.width}x${img.height}`,
          lastModified: new Date(file.lastModified).toLocaleDateString(),
          tags: [...extractedTags, ...dimensionTags]
        };

        resolve({
          id: Date.now(),
          file,
          preview: imageUrl,
          metadata,
          tags: metadata.tags
        });
      };

      img.src = imageUrl;
    });
  };

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer?.files || e.target.files || [])
      .filter(file => file.type.startsWith('image/'));

    const processedImages = await Promise.all(
      files.map(processImage)
    );

    setUploadedImages(prev => [...prev, ...processedImages]);
  }, []);

  const removeImage = (id) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
  };

  const addTag = (imageId, tag) => {
    setUploadedImages(prev => prev.map(img => {
      if (img.id === imageId && !img.tags.includes(tag)) {
        return { ...img, tags: [...img.tags, tag] };
      }
      return img;
    }));
  };

  const removeTag = (imageId, tagToRemove) => {
    setUploadedImages(prev => prev.map(img => {
      if (img.id === imageId) {
        return { ...img, tags: img.tags.filter(tag => tag !== tagToRemove) };
      }
      return img;
    }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Automatic Image Metadata Extraction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center
              ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
            `}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleDrop}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                <Plus className="w-8 h-8 text-gray-400" />
                <p className="text-sm text-gray-600">
                  Drag and drop images or click to upload
                </p>
                <p className="text-xs text-gray-500">
                  Tags will be automatically extracted from image metadata
                </p>
              </div>
            </label>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {uploadedImages.map((image) => (
              <Card key={image.id} className="overflow-hidden">
                <div className="relative">
                  <img
                    src={image.preview}
                    alt={image.metadata.name}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => removeImage(image.id)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">{image.metadata.name}</h3>
                  
                  <div className="text-sm text-gray-500 mb-3">
                    <p>Size: {image.metadata.size}</p>
                    <p>Dimensions: {image.metadata.dimensions}</p>
                    <p>Modified: {image.metadata.lastModified}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Add custom tag..."
                        className="text-sm p-1 border rounded"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                            addTag(image.id, e.target.value.trim().toLowerCase());
                            e.target.value = '';
                          }
                        }}
                      />
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {image.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs flex items-center gap-1"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(image.id, tag)}
                            className="hover:text-blue-600"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageUploadWithMetadata;