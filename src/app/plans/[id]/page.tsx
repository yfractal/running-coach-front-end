'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PlanProgress as PlanProgressType } from '@/types/plan';
import { planService } from '@/services/planService';
import { PlanProgress } from '@/components/PlanProgress';
import { RecordForm } from '@/components/RecordForm';

export default function PlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [progress, setProgress] = useState<PlanProgressType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRecordForm, setShowRecordForm] = useState(false);

  useEffect(() => {
    const fetchPlanProgress = async () => {
      try {
        const data = await planService.getPlanProgress(params.id as string);
        setProgress(data);
      } catch (err) {
        setError('Failed to load plan progress. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlanProgress();
  }, [params.id]);

  const handleAddRecord = async (record: any) => {
    try {
      await planService.createPlanRecord(params.id as string, record);
      const updatedProgress = await planService.getPlanProgress(params.id as string);
      setProgress(updatedProgress);
      setShowRecordForm(false);
    } catch (err) {
      setError('Failed to add record. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !progress) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-600 mb-4">{error || 'Plan not found'}</p>
        <button
          onClick={() => router.push('/plans')}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Back to Plans
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Back
        </button>
        <button
          onClick={() => setShowRecordForm(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Add Record
        </button>
      </div>

      <div className="max-w-3xl mx-auto">
        <PlanProgress progress={progress} />

        {showRecordForm && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Add New Record</h3>
            <RecordForm
              planId={params.id as string}
              onSubmit={handleAddRecord}
              onCancel={() => setShowRecordForm(false)}
            />
          </div>
        )}

        {progress.records.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Records</h3>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {progress.records.map((record) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.value} {progress.plan.unit}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {record.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 