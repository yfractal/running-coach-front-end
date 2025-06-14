import React, { useState } from 'react';
import Link from 'next/link';
import { Plan, PlanRecord } from '@/types/plan';
import { RecordForm } from './RecordForm';

interface PlanCardProps {
  plan: Plan;
  onAddRecord?: (planId: string, record: Omit<PlanRecord, 'id' | 'planId' | 'created_at' | 'updated_at'>) => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan, onAddRecord }) => {
  const [showRecordForm, setShowRecordForm] = useState(false);
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

  const handleAddRecord = (record: Omit<PlanRecord, 'id' | 'planId' | 'created_at' | 'updated_at'>) => {
    onAddRecord?.(plan.id, record);
    setShowRecordForm(false);
  };

  return (
    <div className="relative">
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

      {plan.status === 'active' && (
        <button
          onClick={(e) => {
            e.preventDefault();
            setShowRecordForm(true);
          }}
          className="absolute bottom-4 right-4 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      )}

      {showRecordForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add Record</h2>
              <button
                onClick={() => setShowRecordForm(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <RecordForm
              planId={plan.id}
              onSubmit={handleAddRecord}
              onCancel={() => setShowRecordForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}; 
