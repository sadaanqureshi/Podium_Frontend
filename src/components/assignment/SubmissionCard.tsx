import React, { useState } from 'react';
import { SendHorizontal, Upload, CheckCircle2, FileText, Trash2, Loader2, Eye } from 'lucide-react';
import FilePreviewModal from './FilePreviewModal';

interface SubmissionCardProps {
  submission?: {
    submissionFiles?: string[];
    status?: string;
    marksObtained?: number | null;
  };
  assignmentTotalMarks?: number | null;
  onUpload?: (files: File[]) => Promise<void>;
  onMarkAsDone?: () => void;
  onCommentSubmit?: (comment: string) => void;
  uploadProgress?: number;
  isUploading?: boolean;
  onDeleteFile?: (fileUrl: string) => void;
  fileNames?: Record<string, string>;
  fileSizes?: Record<string, number>;
}

const SubmissionCard: React.FC<SubmissionCardProps> = ({
  submission,
  assignmentTotalMarks,
  onUpload,
  onMarkAsDone,
  onCommentSubmit,
  uploadProgress = 0,
  isUploading = false,
  onDeleteFile,
  fileNames = {},
  fileSizes = {},
}) => {
  const [comment, setComment] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isMarkedDone, setIsMarkedDone] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string>('');

  const extractFileName = (url: string): string => {
    if (fileNames[url]) {
      return fileNames[url];
    }
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const fileName = pathname.split('/').pop() || 'file';
      return decodeURIComponent(fileName.split('?')[0]);
    } catch {
      return 'file';
    }
  };

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${Math.round(mb)}MB`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadClick = async () => {
    if (selectedFiles.length === 0) {
      return;
    }
    if (onUpload) {
      await onUpload(selectedFiles);
      setSelectedFiles([]);
      setFileInputKey(prev => prev + 1);
      // Auto-mark as done when files are submitted
      setIsMarkedDone(true);
      if (onMarkAsDone) {
        onMarkAsDone();
      }
    }
  };

  const handlePreviewFile = (fileUrl: string) => {
    const fileName = extractFileName(fileUrl);
    setPreviewFileName(fileName);
    setPreviewUrl(fileUrl);
  };

  const handleMarkAsDone = () => {
    setIsMarkedDone(true);
    if (onMarkAsDone) {
      onMarkAsDone();
    }
  };

  const handleCommentSubmit = () => {
    if (comment.trim() && onCommentSubmit) {
      onCommentSubmit(comment);
      setComment('');
    }
  };

  const getStatusText = () => {
    if (submission?.status === 'graded' && submission?.marksObtained !== null && submission?.marksObtained !== undefined) {
      const marksObtained = submission.marksObtained;
      if (assignmentTotalMarks !== null && assignmentTotalMarks !== undefined) {
        return `Scored: ${marksObtained}/${assignmentTotalMarks}`;
      }
      return `Scored: ${marksObtained}`;
    }
    if (submission?.status === 'submitted' || submission?.status === 'graded') {
      return 'Submitted';
    }
    if (submission?.status === 'late') {
      return 'Late Submission';
    }
    return 'Grading Required';
  };

  const hasSubmittedFiles = submission?.submissionFiles && submission.submissionFiles.length > 0;
  const showUploadSection = !hasSubmittedFiles && !isUploading && uploadProgress === 0;

  return (
    <>
      {previewUrl && (
        <FilePreviewModal
          url={previewUrl}
          fileName={previewFileName}
          onClose={() => {
            setPreviewUrl(null);
            setPreviewFileName('');
          }}
        />
      )}
      <div className="w-full lg:w-80 shrink-0 space-y-6">
      {/* Your Work Card */}
      <div className="bg-[#F8FAFC] border border-gray-100 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h5 className="font-semibold text-[#101828] text-lg">Your Work</h5>
          <span className="text-gray-500 text-sm">{getStatusText()}</span>
        </div>
        
        {/* Submitted Files Display */}
        {hasSubmittedFiles && (
          <div className="space-y-2 mb-4">
            {submission.submissionFiles!.map((fileUrl: string, index: number) => {
              const fileName = extractFileName(fileUrl);
              const fileSize = fileSizes[fileUrl] || 0;
              
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-[#0060B1] transition-colors">
                  <button
                    onClick={() => handlePreviewFile(fileUrl)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
                  >
                    <FileText size={18} className="text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate text-sm">{fileName}</p>
                      {fileSize > 0 && (
                        <p className="text-xs text-gray-500">File size - {formatFileSize(fileSize)}</p>
                      )}
                    </div>
                    <Eye size={16} className="text-[#0060B1] flex-shrink-0" />
                  </button>
                  {submission?.status !== 'graded' && onDeleteFile && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteFile(fileUrl);
                      }}
                      className="text-red-600 hover:text-red-700 p-1 transition-colors ml-2"
                      title="Delete file"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Upload Progress - Show during upload */}
        {(uploadProgress > 0 || isUploading) && (
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 flex items-center gap-2">
                <Loader2 className="animate-spin" size={16} />
                Uploading...
              </span>
              <span className="font-medium text-[#0060B1]">{Math.round(uploadProgress || 0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#0060B1] h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress || 10}%` }}
              />
            </div>
          </div>
        )}

        {/* File Upload Section - Only show if no submitted files and not uploading */}
        {showUploadSection && (
          <div className="space-y-3">
            <input
              key={fileInputKey}
              type="file"
              multiple
              accept=".pdf,.zip,.doc,.docx,.xls,.xlsx,.txt,.ppt,.pptx"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 border border-[#0060B1] text-[#0060B1] font-semibold rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
            >
              <Upload size={18} />
              Upload Work
            </label>

            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded text-sm">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText size={16} className="text-gray-400 flex-shrink-0" />
                      <span className="truncate text-gray-700">{file.name}</span>
                      <span className="text-gray-500 text-xs flex-shrink-0">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="text-red-600 hover:text-red-700 px-2"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleUploadClick}
                  disabled={isUploading || (uploadProgress > 0 && uploadProgress < 100)}
                  className="w-full py-2.5 px-4 bg-[#0060B1] text-white font-semibold rounded-lg hover:bg-[#005296] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUploading || (uploadProgress > 0 && uploadProgress < 100) ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Uploading...
                    </>
                  ) : (
                    'Submit Files'
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Comment Section */}
      <div className="space-y-3">
        <h5 className="font-semibold text-[#101828]">Add Comment</h5>
        <div className="relative">
          <input 
            type="text" 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
            placeholder="Add Comment" 
            className="w-full py-3 px-4 pr-12 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0060B1]/20 focus:border-[#0060B1] transition-all text-sm"
          />
          <button 
            onClick={handleCommentSubmit}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#475467] hover:text-[#0060B1] transition-colors"
          >
            <SendHorizontal size={20} />
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default SubmissionCard;

