import { useState } from 'react';
import { Plan, duration_type } from '@/types/plan';

interface PlanFormProps {
  initialPlan?: Partial<Plan>;
  onSubmit: (plan: Omit<Plan, 'id' | 'created_at' | 'updated_at'>) => void;
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
    sub_unit: initialPlan.sub_unit || '',
    sub_quality: initialPlan.sub_quality || 0,
    duration_type: initialPlan.duration_type || 'daily' as duration_type,
    duration_value: initialPlan.duration_value || 1,
    start_date: initialPlan.start_date || new Date().toISOString().split('T')[0],
    end_date: initialPlan.end_date || '',
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
            <label htmlFor="sub_quality" className="block text-sm font-medium text-gray-700">
              Sub-Target Amount (Optional)
            </label>
            <input
              type="number"
              id="sub_quality"
              value={formData.sub_quality}
              onChange={(e) => setFormData({ ...formData, sub_quality: parseFloat(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label htmlFor="sub_unit" className="block text-sm font-medium text-gray-700">
              Sub-Unit (Optional)
            </label>
            <input
              type="text"
              id="sub_unit"
              value={formData.sub_unit}
              onChange={(e) => setFormData({ ...formData, sub_unit: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="duration_type" className="block text-sm font-medium text-gray-700">
              Duration Type
            </label>
            <select
              id="duration_type"
              value={formData.duration_type}
              onChange={(e) => setFormData({ ...formData, duration_type: e.target.value as duration_type })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label htmlFor="duration_value" className="block text-sm font-medium text-gray-700">
              Duration Value
            </label>
            <input
              type="number"
              id="duration_value"
              value={formData.duration_value}
              onChange={(e) => setFormData({ ...formData, duration_value: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              min="1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              id="start_date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              id="end_date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              min={formData.start_date}
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