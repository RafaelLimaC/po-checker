import React from 'react';

interface FileUploadProps {
  id: string;
  label: string;
  description: string;
  fileType: 'po' | 'invoice';
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>, fileType: 'po' | 'invoice') => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ id, label, description, fileType, onFileUpload }) => {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">{label}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
      <input
        id={id}
        type="file"
        accept=".csv,.txt"
        onChange={(e) => onFileUpload(e, fileType)}
        className="block w-full text-sm text-slate-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-violet-50 file:text-violet-700
          hover:file:bg-violet-100"
      />
    </div>
  );
};

export default FileUpload;
