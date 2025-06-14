import { useState } from 'react';
import { Plan, DurationType } from '@/types/plan';

interface PlanFormProps {
  initialPlan?: Partial<Plan>;
  onSubmit: (plan: Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export const PlanForm: React.FC<PlanFormProps> = ({
  initialPlan = {},
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: initialPlan.name || '',
    unit: initialPlan.unit || '',
    quality: initialPlan.quality || 0,
    subUnit: initialPlan.subUnit || '',
    subQuality: initialPlan.subQuality || 0,
    durationType: initialPlan.durationType || 'daily' as DurationType,
    durationValue: initialPlan.durationValue || 1,
    startDate: initialPlan.startDate || new Date().toISOString().split('T')[0],
    endDate: initialPlan.endDate || '',
    description: initialPlan.description || '',
    status: initialPlan.status || 'active',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Plan Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="quality" className="block text-sm font-medium text-gray-700">
              Target Amount
            </label>
            <input
              type="number"
              id="quality"
              value={formData.quality}
              onChange={(e) => setFormData({ ...formData, quality: parseFloat(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
              Unit
            </label>
            <input
              type="text"
              id="unit"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="subQuality" className="block text-sm font-medium text-gray-700">
              Sub-Target Amount (Optional)
            </label>
            <input
              type="number"
              id="subQuality"
              value={formData.subQuality}
              onChange={(e) => setFormData({ ...formData, subQuality: parseFloat(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label htmlFor="subUnit" className="block text-sm font-medium text-gray-700">
              Sub-Unit (Optional)
            </label>
            <input
              type="text"
              id="subUnit"
              value={formData.subUnit}
              onChange={(e) => setFormData({ ...formData, subUnit: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="durationType" className="block text-sm font-medium text-gray-700">
              Duration Type
            </label>
            <select
              id="durationType"
              value={formData.durationType}
              onChange={(e) => setFormData({ ...formData, durationType: e.target.value as DurationType })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label htmlFor="durationValue" className="block text-sm font-medium text-gray-700">
              Duration Value
            </label>
            <input
              type="number"
              id="durationValue"
              value={formData.durationValue}
              onChange={(e) => setFormData({ ...formData, durationValue: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              min="1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              min={formData.startDate}
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Save Plan
        </button>
      </div>
    </form>
  );
}; 