import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: true,
  theme: 'base',
  themeVariables: {
    primaryColor: '#0d9488', // teal-600
    primaryTextColor: '#ffffff',
    primaryBorderColor: '#0d9488',
    lineColor: '#94a3b8', // slate-400
    secondaryColor: '#f1f5f9', // slate-100
    tertiaryColor: '#ffffff'
  },
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: 'basis'
  }
});

const ConceptMap = ({ data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (data && data.nodes && data.nodes.length > 0) {
      // Clear previous chart
      if (chartRef.current) {
        chartRef.current.innerHTML = '';
      }
      
      // Convert JSON logic to Mermaid syntax
      let mermaidSyntax = 'graph TD\n';
      
      // Add nodes
      data.nodes.forEach(node => {
        // Sanitize label (remove quotes, brackets that break mermaid)
        const sanitizedLabel = node.label.replace(/["'\[\]\(\)\{\}]/g, '');
        mermaidSyntax += `    ${node.id}["${sanitizedLabel}"]\n`;
      });
      
      // Add edges
      data.edges.forEach(edge => {
        const relationship = edge.label ? ` -- ${edge.label.replace(/["'\[\]\(\)\{\}]/g, '')} --> ` : ' --> ';
        mermaidSyntax += `    ${edge.from}${relationship}${edge.to}\n`;
      });

      // Render chart
      const renderChart = async () => {
        try {
          const { svg } = await mermaid.render(`mermaid-${Math.random().toString(36).substr(2, 9)}`, mermaidSyntax);
          if (chartRef.current) {
            chartRef.current.innerHTML = svg;
          }
        } catch (error) {
          console.error('Mermaid Render Error:', error);
          if (chartRef.current) {
            chartRef.current.innerHTML = '<div class="text-red-500 text-xs p-4">Failed to render concept map. Try regenerating.</div>';
          }
        }
      };
      
      renderChart();
    }
  }, [data]);

  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
        <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <p className="text-slate-400 text-sm">No data available for the concept map.</p>
        </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col scrollbar-hide">
      <div 
        ref={chartRef} 
        className="mermaid-chart flex justify-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-auto max-h-[600px]"
      />
      <div className="mt-4 p-4 bg-teal-50/50 rounded-xl border border-teal-100">
          <p className="text-[10px] text-teal-600 font-black uppercase tracking-widest mb-1">Study Tip</p>
          <p className="text-xs text-slate-600 leading-normal">
              This map shows how key ideas in your document relate to each other. Focus on the central nodes to master the core topic first.
          </p>
      </div>
    </div>
  );
};

export default ConceptMap;
