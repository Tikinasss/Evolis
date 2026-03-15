import { useState } from "react";
import { jsPDF } from "jspdf";

/**
 * Format large numbers with appropriate units (Billions, Millions, etc.)
 */
const formatCurrency = (value) => {
  if (!value && value !== 0) return 'N/A';
  const num = Math.abs(Number(value));
  
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)} milliards USD`;
  } else if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)} millions USD`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K USD`;
  } else {
    return `${num.toFixed(0)} USD`;
  }
};

function ExportPanel({ result, notes = [] }) {
  const [exportFormat, setExportFormat] = useState("pdf");
  const [exportDetails, setExportDetails] = useState("full");
  const [showMenu, setShowMenu] = useState(false);

  const hasDetailedStructure =
    result.financial_snapshot ||
    result.projections_12_months ||
    result.training_resources ||
    (Array.isArray(result.main_problems) &&
      result.main_problems.length > 0 &&
      typeof result.main_problems[0] === "object" &&
      result.main_problems[0]?.problem);

  const handleExportPdf = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 15;

    // === PROFESSIONAL HEADER ===
    // Background bar
    doc.setFillColor(40, 40, 80);
    doc.rect(0, 0, pageWidth, 35, 'F');

    // Title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('AI Business Rescue', 14, 12);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Diagnostic & Recovery Plan', 14, 20);

    // Risk Badge
    const riskColors = {
      'High': [220, 38, 38],
      'Medium': [217, 119, 6],
      'Low': [34, 197, 94]
    };
    const riskColor = riskColors[result.risk_level] || [100, 100, 100];
    doc.setFillColor(...riskColor);
    doc.rect(pageWidth - 45, 8, 35, 12, 'F');
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`Risk: ${result.risk_level || 'Unknown'}`, pageWidth - 43, 15);

    y = 40;

    // === EXECUTIVE SUMMARY ===
    doc.setFillColor(245, 245, 250);
    doc.rect(10, y - 3, pageWidth - 20, 22, 'F');
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(40, 40, 80);
    doc.text('Executive Summary', 14, y + 4);

    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(60, 60, 80);
    const summaryText = `Company: ${result.company_name || 'N/A'} | Industry: ${result.industry || 'N/A'} | Date: ${new Date().toLocaleDateString('en-US')}`;
    doc.text(summaryText, 14, y + 12);
    const healthScore = result.financial_snapshot?.health_score;
    const healthText = healthScore ? `Current Health Score: ${healthScore}/100` : 'Analysis in progress';
    doc.text(healthText, 14, y + 18);
    y += 28;

    // Helper function to add a professional section
    const addProfessionalSection = (title, items, maxWidth = 180) => {
      if (y > pageHeight - 25) {
        doc.addPage();
        y = 15;
      }

      // Section header with underline
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(40, 40, 80);
      doc.text(title, 14, y);
      doc.setDrawColor(100, 150, 200);
      doc.line(14, y + 1.5, pageWidth - 14, y + 1.5);
      y += 8;

      // Content
      doc.setFont(undefined, 'normal');
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(9);

      if (!items || items.length === 0) {
        doc.setTextColor(180, 180, 180);
        doc.text('No items to display', 16, y);
        y += 4;
      } else {
        items.forEach((item, idx) => {
          if (y > pageHeight - 12) {
            doc.addPage();
            y = 15;
          }
          const lines = doc.splitTextToSize(`• ${item}`, maxWidth);
          doc.text(lines, 16, y);
          y += lines.length * 4 + 1;
        });
      }

      y += 3;
    };

    // Helper for financial metrics table
    const addFinancialMetrics = (title, metrics) => {
      if (y > pageHeight - 40) {
        doc.addPage();
        y = 15;
      }

      // Header
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(40, 40, 80);
      doc.text(title, 14, y);
      doc.setDrawColor(100, 150, 200);
      doc.line(14, y + 1.5, pageWidth - 14, y + 1.5);
      y += 8;

      // Metrics grid
      const colWidth = (pageWidth - 28) / 2;
      let col = 0;

      Object.entries(metrics).forEach(([key, value]) => {
        if (!value && value !== 0) return; // Skip empty values

        const xPos = 14 + (col * colWidth);
        
        // Light background
        doc.setFillColor(245, 247, 255);
        doc.rect(xPos, y - 2, colWidth - 2, 14, 'F');

        // Border
        doc.setDrawColor(200, 210, 230);
        doc.rect(xPos, y - 2, colWidth - 2, 14);

        // Label
        doc.setFontSize(8);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(100, 120, 150);
        doc.text(key, xPos + 3, y + 1);

        // Value - format if it's already a string, otherwise truncate safely
        let valueText = String(value);
        // Only truncate if very long and doesn't look formatted
        if (valueText.length > 25 && !valueText.includes('USD') && !valueText.includes('milliards') && !valueText.includes('millions')) {
          valueText = valueText.substring(0, 20) + '...';
        }
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(40, 40, 80);
        doc.text(valueText, xPos + 3, y + 8);

        col++;
        if (col === 2) {
          col = 0;
          y += 16;
        }
      });

      if (col !== 0) y += 16;
      y += 2;
    };

    // === MAIN CONTENT ===
    if (exportDetails === 'full') {
      // Financial Snapshot
      const finData = result.financial_snapshot || {};
      const financialMetrics = {};
      
      if (finData.health_score !== undefined && finData.health_score !== null) 
        financialMetrics['Health Score'] = `${finData.health_score}/100`;
      if (finData.current_cash_position) 
        financialMetrics['Cash Position'] = formatCurrency(finData.current_cash_position);
      if (finData.cash_flow) 
        financialMetrics['Cash Flow'] = formatCurrency(finData.cash_flow);
      if (finData.debt_ratio) 
        financialMetrics['Debt Ratio'] = finData.debt_ratio;
      if (finData.operating_margin) 
        financialMetrics['Operating Margin'] = `${finData.operating_margin}%`;

      if (Object.keys(financialMetrics).length > 0) {
        addFinancialMetrics('Financial Snapshot', financialMetrics);
      }

      // Main Problems
      const mainProblems = Array.isArray(result.main_problems)
        ? result.main_problems
            .map((item) =>
              typeof item === 'string'
                ? item
                : `${item.problem} [${item.severity || 'Medium'}]${item.impact ? ' - ' + item.impact : ''}`
            )
            .filter(Boolean)
        : [];
      
      if (mainProblems.length > 0) {
        addProfessionalSection('Main Problems & Issues', mainProblems);
      }

      // Recovery Plan
      const recoveryPlan = Array.isArray(result.recovery_plan)
        ? result.recovery_plan
            .map((item) =>
              typeof item === 'string'
                ? item
                : `${item.phase || 'Phase'}: ${item.focus}${item.actions ? ' - ' + item.actions.join(', ') : ''}`
            )
            .filter(Boolean)
        : [];
      
      if (recoveryPlan.length > 0) {
        addProfessionalSection('Recovery Plan', recoveryPlan);
      }

      // Recommendations
      const recommendations = Array.isArray(result.recommendations)
        ? result.recommendations
            .map((item) =>
              typeof item === 'string'
                ? item
                : `${item.recommendation}${item.priority ? ' [' + item.priority + ']' : ''}${item.estimated_roi ? ' - ROI: ' + item.estimated_roi : ''}`
            )
            .filter(Boolean)
        : [];
      
      if (recommendations.length > 0) {
        addProfessionalSection('Strategic Recommendations', recommendations);
      }

      // Projections
      if (result.projections_12_months && Array.isArray(result.projections_12_months) && result.projections_12_months.length > 0) {
        const projectionItems = result.projections_12_months
          .map((p) => {
            const parts = [];
            if (p.month !== undefined) parts.push(`Month ${p.month}`);
            if (p.health_score !== undefined) parts.push(`Health: ${p.health_score}/100`);
            if (p.revenue !== undefined) parts.push(`Revenue: ${formatCurrency(p.revenue)}`);
            if (p.debt !== undefined) parts.push(`Debt: ${formatCurrency(p.debt)}`);
            return parts.join(' | ');
          })
          .filter(Boolean);
        
        if (projectionItems.length > 0) {
          addProfessionalSection('12-Month Projections', projectionItems);
        }
      }

      // Training Resources
      if (result.training_resources && Array.isArray(result.training_resources) && result.training_resources.length > 0) {
        const trainingItems = result.training_resources
          .map((t) => {
            const parts = [];
            if (t.resource_name) parts.push(t.resource_name);
            if (t.topic) parts.push(`Topic: ${t.topic}`);
            if (t.duration) parts.push(`Duration: ${t.duration}`);
            return parts.length > 0 ? parts.join(' - ') : null;
          })
          .filter(Boolean);
        
        if (trainingItems.length > 0) {
          addProfessionalSection('Recommended Training Resources', trainingItems);
        }
      }
    } else {
      // SIMPLE VERSION
      const mainProblems = Array.isArray(result.main_problems)
        ? result.main_problems
            .map((item) => (typeof item === 'string' ? item : item.problem))
            .filter(Boolean)
        : [];
      
      if (mainProblems.length > 0) {
        addProfessionalSection('Main Problems', mainProblems);
      }

      const recoveryPlan = Array.isArray(result.recovery_plan)
        ? result.recovery_plan
            .map((item) => (typeof item === 'string' ? item : `${item.phase}: ${item.focus}`))
            .filter(Boolean)
        : [];
      
      if (recoveryPlan.length > 0) {
        addProfessionalSection('Recovery Plan', recoveryPlan);
      }

      const recommendations = Array.isArray(result.recommendations)
        ? result.recommendations
            .map((item) => (typeof item === 'string' ? item : item.recommendation))
            .filter(Boolean)
        : [];
      
      if (recommendations.length > 0) {
        addProfessionalSection('Recommendations', recommendations);
      }
    }

    // === NOTES SECTION ===
    if (notes && notes.length > 0) {
      if (y > pageHeight - 40) {
        doc.addPage();
        y = 15;
      }

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(40, 40, 80);
      doc.text('Analysis Notes', 14, y);
      doc.setDrawColor(100, 150, 200);
      doc.line(14, y + 1.5, pageWidth - 14, y + 1.5);
      y += 8;

      notes.forEach((note) => {
        if (y > pageHeight - 18) {
          doc.addPage();
          y = 15;
        }

        const noteDate = new Date(note.createdAt).toLocaleDateString('en-US');
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(60, 90, 140);
        doc.text(`${note.authorName || 'User'} - ${noteDate}`, 16, y);
        y += 4;

        doc.setFont(undefined, 'normal');
        doc.setTextColor(40, 40, 40);
        const lines = doc.splitTextToSize(note.content, 175);
        doc.text(lines, 16, y);
        y += lines.length * 3.5 + 3;
      });
    }

    // === FOOTER ===
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `© 2026 Evolis AI - Document generated on ${new Date().toLocaleDateString('en-US')}`,
      14,
      pageHeight - 8
    );

    doc.save(`diagnostic-${result.company_name || 'analyse'}-${Date.now()}.pdf`);
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowMenu(!showMenu)}
        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
      >
        📥 Export
      </button>

      {showMenu && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-lg border border-slate-200 bg-white shadow-lg z-50">
          <div className="space-y-4 p-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Detail Level:
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    value="full"
                    checked={exportDetails === "full"}
                    onChange={(e) => setExportDetails(e.target.value)}
                    className="h-4 w-4"
                  />
                  <span>Full version</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    value="simple"
                    checked={exportDetails === "simple"}
                    onChange={(e) => setExportDetails(e.target.value)}
                    className="h-4 w-4"
                  />
                  <span>Summary version</span>
                </label>
              </div>
            </div>

            {hasDetailedStructure && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 p-2">
                <span className="text-sm text-green-700">
                  ✓ Detailed version available
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={handleExportPdf}
              className="w-full rounded-lg bg-rescue-main px-3 py-2 text-sm font-semibold text-white hover:bg-rescue-dark"
            >
              🔄 Export to PDF
            </button>

            <button
              type="button"
              onClick={() => setShowMenu(false)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExportPanel;
