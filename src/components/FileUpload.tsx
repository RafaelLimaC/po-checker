import { useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface FileUploadProps {
  onFileLoaded: (content: string) => void;
  accept?: string;
  label: string;
}

export const FileUpload = ({ onFileLoaded, accept = ".csv", label }: FileUploadProps) => {
  const { toast } = useToast();

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileLoaded(content);
      toast({
        title: "Arquivo carregado com sucesso!",
        description: `${file.name} foi processado.`,
      });
    };
    reader.readAsText(file);
  }, [onFileLoaded, toast]);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type="file"
        accept={accept}
        onChange={handleFileUpload}
        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
      />
    </div>
  );
};
