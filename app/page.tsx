// src/app/page.tsx
import { supabase } from '@/lib/supabase';

// This function runs on the server during the build process
async function getConditions() {
  const { data: conditions, error } = await supabase
    .from('conditions')
    .select('*');

  if (error) {
	console.error('--- SUPABASE ERROR ---');
	console.dir(error, { depth: null }); // Forces Node to print the full object tree
	console.error('Error Message:', error.message);
  return [];
  }
  return conditions;
}

export default async function Home() {
  const conditions = await getConditions();

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">NPA Treatment Database</h1>
      <div className="grid gap-4">
        {conditions?.map((condition) => (
          <div key={condition.id} className="p-4 border rounded shadow">
            <h2 className="text-xl font-semibold">{condition.title}</h2>
            <p className="text-gray-600">{condition.description}</p>
          </div>
        ))}
      </div>
    </main>
  );
}