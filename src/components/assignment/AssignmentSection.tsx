import React, { useState } from 'react';
import { MoveLeft, Download, FileText, Eye } from 'lucide-react';
import Link from 'next/link';
import FilePreviewModal from './FilePreviewModal';

interface AssignmentMaterial {
  id: number;
  fileUrl: string;
  fileName: string | null;
  fileSize: number | null;
  fileType: string | null;
}

interface AssignmentSectionProps {
  assignment: {
    id: number;
    title: string;
    dueDate: string | null;
    description?: string | null;
    objective?: string | null;
    deliverable?: string | null;
    format?: string | null;
    totalMarks?: number | null;
    materials?: AssignmentMaterial[];
  };
  onBack?: () => void;
}

const AssignmentSection: React.FC<AssignmentSectionProps> = ({ assignment, onBack }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string>('');

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-GB', { month: 'short' });
    const year = date.getFullYear();
    return `${day}, ${month} ${year}`;
  };

  const handlePreviewFile = (fileUrl: string, fileName: string) => {
    setPreviewFileName(fileName);
    setPreviewUrl(fileUrl);
  };

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
      <div className="flex-1">
      {onBack ? (
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-6 text-sm font-medium"
        >
          <MoveLeft size={18} />
          Back
        </button>
      ) : (
        <Link 
          href="/assignment"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-6 text-sm font-medium"
        >
          <MoveLeft size={18} />
          Back
        </Link>
      )}

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
        <h3 className="text-[#0060B1] text-xl font-bold">{assignment.title}</h3>
        <div className="flex flex-col items-end gap-1">
          <span className="text-gray-500 text-sm">Last Date of Submission : {formatDate(assignment.dueDate)}</span>
          {assignment.totalMarks && (
            <span className="text-gray-600 text-sm font-medium">Total Marks: {assignment.totalMarks}</span>
          )}
        </div>
      </div>

      {assignment.description && (
        <h4 className="text-[#475467] font-semibold text-lg mb-8">
          {assignment.description}
        </h4>
      )}

      <div className="space-y-6 text-[#475467] leading-relaxed max-w-4xl">
        <p className="font-medium text-sm uppercase tracking-wider text-gray-400">Assignment Description:</p>
        
        {assignment.description && (
          <p>
            {assignment.description}
          </p>
        )}

        {assignment.objective && (
          <div>
            <p className="font-semibold text-gray-800 mb-1">Objective:</p>
            <p>{assignment.objective}</p>
          </div>
        )}

        {assignment.deliverable && (
          <div>
            <p className="font-semibold text-gray-800 mb-1">Deliverable:</p>
            <p>{assignment.deliverable}</p>
          </div>
        )}

        {assignment.format && (
          <div>
            <p className="font-semibold text-gray-800 mb-1">Format:</p>
            <p>{assignment.format}</p>
          </div>
        )}

        {assignment.materials && assignment.materials.length > 0 && (
          <div>
            <p className="font-semibold text-gray-800 mb-3">Assignment Materials:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {assignment.materials.map((material) => {
                const formatFileSize = (bytes: number | null): string => {
                  if (bytes === null || bytes === undefined) return 'N/A';
                  const mb = bytes / (1024 * 1024);
                  if (mb < 1) {
                    const kb = bytes / 1024;
                    return `${Math.round(kb)}KB`;
                  }
                  return `${Math.round(mb * 10) / 10}MB`;
                };

                return (
                  <div
                    key={material.id}
                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-[#0060B1] transition-colors group"
                  >
                    <FileText size={20} className="text-gray-500 group-hover:text-[#0060B1] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{material.fileName || 'Material File'}</p>
                      <p className="text-xs text-gray-500">
                        {material.fileType || 'Unknown'} - {formatFileSize(material.fileSize)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handlePreviewFile(material.fileUrl, material.fileName || 'Material File')}
                        className="p-2 text-gray-400 hover:text-[#0060B1] transition-colors"
                        title="Preview file"
                      >
                        <Eye size={18} />
                      </button>
                      <a
                        href={material.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-[#0060B1] transition-colors"
                        title="Download file"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download size={18} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default AssignmentSection;

