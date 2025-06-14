import React from 'react';
import { PlanProgress as PlanProgressType } from '@/types/plan';

interface PlanProgressProps {
  progress: PlanProgressType;
}

export const PlanProgress: React.FC<PlanProgressProps> = ({ progress }) => {
  const { plan, remainingValue, remainingDays } = progress;
  const progressPercentage = Math.min(100, progress.progress);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">{plan.name}</h2>
      
      <div className="space-y-6">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{progressPercentage.toFixed(1)}%</span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">Remaining</div>
            <div className="text-xl font-semibold text-gray-900">
              {remainingValue} {plan.unit}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">Days Left</div>
            <div className="text-xl font-semibold text-gray-900">{remainingDays}</div>
          </div>
        </div>

        {/* Daily Target */}
        {plan.subQuality && (
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-blue-600">Target per {plan.durationType}</div>
            <div className="text-xl font-semibold text-blue-700">
              {plan.subQuality} {plan.subUnit}
            </div>
          </div>
        )}

        {/* Date Range */}
        <div className="flex justify-between text-sm text-gray-500">
          <div>
            <span className="block text-gray-400">Start Date</span>
            <span>{new Date(plan.startDate).toLocaleDateString()}</span>
          </div>
          <div className="text-right">
            <span className="block text-gray-400">End Date</span>
            <span>{new Date(plan.endDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 