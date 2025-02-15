import React, { useState } from 'react'

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [metadata, setMetadata] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const extractMetadata = () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    // Temporary placeholder for metadata extraction
    const mockMetadata = {
      fileName: selectedFile.name,
      fileType: selectedFile.type,
      fileSize: `${(selectedFile.size / 1024).toFixed(2)} KB`,
      lastModified: new Date(selectedFile.lastModified).toLocaleString()
    };

    setMetadata(mockMetadata);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Image Metadata Extractor</h1>
      
      <div className="mb-4">
        <input 
          type="file" 
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>

      <button 
        onClick={extractMetadata}
        disabled={!selectedFile}
        className="bg-blue-500 text-white px-4 py-2 rounded 
        hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Extract Metadata
      </button>

      {metadata && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-semibold mb-4">Metadata</h2>
          <table className="w-full">
            <tbody>
              {Object.entries(metadata).map(([key, value]) => (
                <tr key={key} className="border-b">
                  <td className="py-2 font-medium">{key}</td>
                  <td className="py-2">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;