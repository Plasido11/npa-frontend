// src/components/TreatmentMatrix.tsx
'use client';

import { useState } from 'react';

// Mock data representing a joined database query for a specific condition
const mockSymptomData = [
  {
    type: 'Cognitive',
    symptoms: [
      { name: 'Memory Loss', treatments: ['Cognitive Behavioral Therapy', 'Occupational Therapy'] },
      { name: 'Attention Deficit', treatments: ['Cognitive Restructuring', 'Medication Management'] }
    ]
  },
  {
    type: 'Physical',
    symptoms: [
      { name: 'Muscle Weakness', treatments: ['Physical Therapy', 'Assistive Devices'] },
      { name: 'Balance Issues', treatments: ['Vestibular Rehabilitation', 'Physical Therapy'] }
    ]
  }
];

export default function TreatmentMatrix() {
  const [activeSymptom, setActiveSymptom] = useState<string>('All');

  // Extract a flat list of all unique symptom names for the selector
  const allSymptoms = mockSymptomData.flatMap(group => group.symptoms.map(s => s.name));

  return (
    <div className="mt-8 p-6 bg-white border rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Treatment Matrix</h2>
      
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
        {mockSymptomData.map((group) => {
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
