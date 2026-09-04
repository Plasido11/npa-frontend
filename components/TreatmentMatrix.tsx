// src/components/TreatmentMatrix.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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

  if (isLoading) return <div className="mt-8 p-6">Loading matrix data...</div>;
  if (symptomData.length === 0) return null;

  const allSymptoms = symptomData.flatMap(group => group.symptoms.map(s => s.name));

  return (
    <div className="mt-8 p-6 bg-white border rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Treatment Matrix</h2>
      
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

      <div className="space-y-6">
        {symptomData.map((group) => {
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
