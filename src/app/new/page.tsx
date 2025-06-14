'use client';

import { useRouter } from 'next/navigation';
import { planService } from '@/services/planService';
import { PlanForm } from '@/components/PlanForm';

export default function NewPlanPage() {
  const router = useRouter();

  const handleSubmit = async (planData: any) => {
    try {
      const newPlan = await planService.createPlan(planData);
      router.push(`/${newPlan.id}`);
    } catch (error) {
      console.error('Failed to create plan:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Plan</h1>
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <PlanForm
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
          />
        </div>
      </div>
    </div>
  );
} 