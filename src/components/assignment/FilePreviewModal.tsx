import React from 'react';
import { X } from 'lucide-react';

interface FilePreviewModalProps {
  url: string;
  fileName: string;
  onClose: () => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ url, fileName, onClose }) => {
  // Helper function to extract file extension from fileName
  const getFileExtension = (fileName: string): string => {
    const lastDot = fileName.lastIndexOf('.');
    return lastDot !== -1 ? fileName.substring(lastDot) : '';
  };

  // Helper function to prepare Cloudinary URL for viewers
  // For Office documents, convert raw/upload to image/upload as Office viewers may handle it better
  // Adds dl=false to force inline display instead of download
  const prepareFileUrl = (url: string, isOfficeDoc: boolean): string => {
    let preparedUrl = url;
    
    // Convert raw/upload to image/upload for Office documents
    if (isOfficeDoc && url.includes('/raw/upload/')) {
      preparedUrl = url.replace('/raw/upload/', '/image/upload/');
    }
    
    // Remove any existing query parameters first
    const urlWithoutParams = preparedUrl.split('?')[0];
    // Add dl=false to force inline display instead of download
    return `${urlWithoutParams}?dl=false`;
  };

  // Convert Cloudinary raw URL to image URL for preview
  const imagePreviewUrl = url.replace('/raw/upload/', '/image/upload/');
  
  // Helper function to check if file is a PDF
  const isPDF = (fileName: string, url: string): boolean => {
    const lowerFileName = fileName.toLowerCase();
    const lowerUrl = url.toLowerCase();
    return lowerFileName.endsWith('.pdf') || lowerUrl.includes('.pdf');
  };

  // Helper function to check if file is an Office document
  const isOfficeDocument = (fileName: string, url: string): boolean => {
    const officeExtensions = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];
    const lowerFileName = fileName.toLowerCase();
    const lowerUrl = url.toLowerCase();
    return officeExtensions.some(ext => 
      lowerFileName.endsWith(ext) || lowerUrl.includes(ext)
    );
  };

  // Check file types
  const isPDFFile = isPDF(fileName, url);
  const isOfficeDoc = isOfficeDocument(fileName, url);

  // Prepare the file URL for viewers (convert raw to image for Office docs)
  const preparedFileUrl = prepareFileUrl(url, isOfficeDoc);

  // Use Google Docs viewer for PDFs (use correct gview endpoint)
  const googleDocsUrl = `https://docs.google.com/gview?url=${encodeURIComponent(preparedFileUrl)}&embedded=true`;
  
  // Use Microsoft Office Online viewer for Office documents (may work better than Google Docs for Office files)
  const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(preparedFileUrl)}`;

  // Determine which viewer to use
  const getPreviewUrl = (): string => {
    if (isPDFFile) {
      return googleDocsUrl;
    } else if (isOfficeDoc) {
      // Try Microsoft Office Online viewer for Office documents
      return officeViewerUrl;
    } else {
      return imagePreviewUrl;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div 
        className="relative bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 truncate flex-1 mr-4">
            {fileName}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            aria-label="Close preview"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-hidden">
          {/* Use Google Docs viewer for PDFs, Microsoft Office Online for Office docs, image conversion for others */}
          <iframe
            src={getPreviewUrl()}
            width="100%"
            height="100%"
            title={fileName}
            className="border-0"
            style={{ minHeight: '600px' }}
          />
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;

