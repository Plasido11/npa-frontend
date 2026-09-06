// src/components/TreatmentMatrix.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper interface for our formatted groups
interface SymptomGroup {
  type: string;
  symptoms: { name: string; treatments: string[] }[];
}

export default function TreatmentMatrix({ conditionId }: { conditionId: number }) {
  const [activeSymptom, setActiveSymptom] = useState<string>('All');
  const [symptomData, setSymptomData] = useState<SymptomGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMatrixData() {
      // Fetch relational data through the junction tables
      const { data, error } = await supabase
        .from('condition_symptom')
        .select(`
          symptoms (
            name,
            type,
            symptom_therapy (
              therapies (
                title
              )
            )
          )
        `)
        .eq('condition_id', conditionId);

      if (error) {
        console.error('Error fetching matrix data:', error);
        setIsLoading(false);
        return;
      }

      // Format the raw SQL output into grouped arrays by type
      const groups: Record<string, SymptomGroup> = {};

      data?.forEach((row: any) => {
        const symptom = row.symptoms;
        if (!symptom) return;

        const type = symptom.type;
        const name = symptom.name;
        // Map the deeply nested therapy titles into a flat array
        const treatments = symptom.symptom_therapy.map(
          (st: any) => st.therapies?.title
        ).filter(Boolean);

        if (!groups[type]) {
          groups[type] = { type, symptoms: [] };
        }
        groups[type].symptoms.push({ name, treatments });
      });

      setSymptomData(Object.values(groups));
      setIsLoading(false);
    }

    fetchMatrixData();
  }, [conditionId]);

  const handleDownloadPDF = () => {
    // Initialize a new PDF document
    const doc = new jsPDF();
    
    // Add Header
    doc.setFontSize(22);
    doc.setTextColor(30, 64, 175); // A nice blue
    doc.text('Treatment Reference Guide', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    // Filter the data based on current UI state
    const rows: string[][] = [];
    
    symptomData.forEach((group) => {
      const filteredSymptoms = group.symptoms.filter(
        s => activeSymptom === 'All' || s.name === activeSymptom
      );
      
      filteredSymptoms.forEach(symptom => {
        // Create a row for the table: [Symptom Name, Category, Treatments List]
        rows.push([
          symptom.name,
          group.type,
          symptom.treatments.join('\n• ') // Bullet points for treatments
        ]);
      });
    });

    // Generate the table
    autoTable(doc, {
      startY: 40,
      head: [['Symptom', 'Category', 'Recommended Treatments']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [30, 64, 175] }, // Match the header blue
      styles: { cellPadding: 5, fontSize: 10 },
    });

    // Trigger the download
    doc.save('Treatment_Matrix.pdf');
  };

  if (isLoading) return <div className="mt-8 p-6">Loading matrix data...</div>;
  if (symptomData.length === 0) return null;

  // Extract a flat list of all unique symptom names for the selector
  const allSymptoms = mockSymptomData.flatMap(group => group.symptoms.map(s => s.name));

  return (
    <div className="mt-8 p-6 bg-white border rounded-lg shadow-sm">
     <div className="flex justify-between items-center mb-4"> 
      <h2 className="text-2xl font-bold mb-4">Treatment Matrix</h2>

       {/* The New PDF Download Button */}
        <button 
          onClick={handleDownloadPDF}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
        >
          Download PDF
        </button>
      </div>
      
      {/* Symptom Selector */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Symptom:</label>
        <select 
          className="w-full max-w-xs p-2 border rounded text-black"
          value={activeSymptom}
          onChange={(e) => setActiveSymptom(e.target.value)}
        >
          <option value="All">All Symptoms</option>
          {allSymptoms.map(symptom => (
            <option key={symptom} value={symptom}>{symptom}</option>
          ))}
        </select>
      </div>

      {/* Filtered Treatment Cards Grouped by Type */}
      <div className="space-y-6">
        {symptomData.map((group) => {
          // Filter symptoms based on the active selection
          const filteredSymptoms = group.symptoms.filter(
            s => activeSymptom === 'All' || s.name === activeSymptom
          );

          if (filteredSymptoms.length === 0) return null;

          return (
            <div key={group.type}>
              <h3 className="text-lg font-bold text-blue-800 border-b pb-2 mb-3">{group.type} Symptoms</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {filteredSymptoms.map((symptom) => (
                  <div key={symptom.name} className="p-4 bg-gray-50 border rounded">
                    <h4 className="font-semibold text-gray-900 mb-2">{symptom.name}</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {symptom.treatments.map(treatment => (
                        <li key={treatment}>{treatment}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
