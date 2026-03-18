import { useState } from 'react';
import { useCVStore } from './store/cvStore';
import { EditorPanel } from './components/Editor/EditorPanel';
import { LayoutEngine } from './components/CVPreview/LayoutEngine';
import { Loader2 } from 'lucide-react';

function App() {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const { sections, styleConfig } = useCVStore();

  const exportPDF = async (overrideTheme?: 'Minimal Professional' | 'Modern Sidebar') => {
    const targetTheme = overrideTheme || styleConfig.theme;
    if (isExporting) return;
    setIsExporting(targetTheme);

    try {
      // Use environment variable for the API base URL, defaulting to localhost for development
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/api/export-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: window.location.origin + '/print-view',
          sections,
          styleConfig: {
            ...styleConfig,
            theme: targetTheme
          }
        }),
      });
      
      if (response.ok) {
        const pdfBlob = await response.blob();
        // Explicitly create a new blob with the MIME type if the response one is missing it
        const blob = new Blob([pdfBlob], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cv-${targetTheme === 'Modern Sidebar' ? 'modern' : 'minimal'}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Export failed:', response.status, errorData);
        alert(`Failed to generate PDF (${response.status}). ${errorData.details || 'Please try again.'}`);
      }
    } catch (err) {
      console.error('Failed to export PDF', err);
      alert('Error connecting to export server. Check if the backend is running.');
    } finally {
      setIsExporting(null);
    }
  };

  // Simple routing for print-view
  if (window.location.pathname === '/print-view') {
    return (
      <div className="print-container bg-white">
        <LayoutEngine scale={1} isPreview={false} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      <div className="w-[450px] min-w-[450px] h-full shadow-xl z-20">
        <EditorPanel />
      </div>
      
      <div className="flex-1 h-full overflow-y-auto relative p-8">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="w-full h-fit flex justify-center gap-4 mb-8">
            <button
              onClick={() => exportPDF('Minimal Professional')}
              disabled={!!isExporting}
              className={`flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-50 hover:border-slate-400 hover:bg-slate-50 min-w-[240px] shadow-sm`}
            >
              {isExporting === 'Minimal Professional' && <Loader2 className="animate-spin" size={20} />}
              {isExporting === 'Minimal Professional' ? 'Exporting Minimal...' : 'Export Minimal Professional'}
            </button>

            <button
              onClick={() => exportPDF('Modern Sidebar')}
              disabled={!!isExporting}
              className={`flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50 min-w-[240px]`}
            >
              {isExporting === 'Modern Sidebar' && <Loader2 className="animate-spin" size={20} />}
              {isExporting === 'Modern Sidebar' ? 'Exporting Sidebar...' : 'Export Modern Sidebar'}
            </button>
          </div>
          
          {/* Centered preview, scaled slightly if needed to fit screens, but A4 proportion intact */}
          <div className="origin-top flex justify-center w-full pb-20">
            <LayoutEngine scale={0.8} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
