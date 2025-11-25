import { Button } from "@/components/ui/button";
import { Download, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ExportTaxReportButtonProps {
  csvContent: string;
  year: number;
}

export const ExportTaxReportButton = ({ csvContent, year }: ExportTaxReportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = () => {
    setIsExporting(true);

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `tax_report_${year}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsExporting(false);
      toast({
        title: "Export Successful",
        description: `Tax report for ${year} has been downloaded.`,
        duration: 3000,
      });
    }, 500);
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      className="rounded-xl"
      size="lg"
    >
      {isExporting ? (
        <>
          <CheckCircle2 className="h-5 w-5 mr-2 animate-pulse" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="h-5 w-5 mr-2" />
          Export Tax Report (CSV)
        </>
      )}
    </Button>
  );
};
