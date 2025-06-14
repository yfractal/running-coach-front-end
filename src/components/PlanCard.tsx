import React from 'react';
import Link from 'next/link';
import { Plan } from '@/types/plan';

interface PlanCardProps {
  plan: Plan;
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan }) => {
  const daysLeft = Math.max(0, Math.ceil((new Date(plan.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Link href={`/plans/${plan.id}`}>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
          <span className={`px-2 py-1 text-sm font-medium rounded-full ${getStatusColor(plan.status)}`}>
            {plan.status}
          </span>
        </div>
        
        <div className="space-y-2">
          <p className="text-gray-600">
            Target: {plan.quality} {plan.unit}
          </p>
          {plan.sub_quality && (
            <p className="text-gray-600">
              {plan.sub_quality} {plan.sub_unit} per {plan.duration_type}
            </p>
          )}
          <div className="flex justify-between text-sm text-gray-500">
            <span>Started: {new Date(plan.start_date).toLocaleDateString()}</span>
            <span>{daysLeft} days left</span>
          </div>
        </div>

        {plan.description && (
          <p className="mt-4 text-gray-600 text-sm line-clamp-2">{plan.description}</p>
        )}
      </div>
    </Link>
  );
}; 