import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { EMI } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Plus, Edit, Trash2, CreditCard } from 'lucide-react';
import { formatCurrency, calculateRemainingMonths } from '../utils/calculations';

const Setup: React.FC = () => {
  const { state, addEMI, updateEMIAction, deleteEMIAction } = useFinance();
  const [isAddingEMI, setIsAddingEMI] = useState(false);
  const [editingEMI, setEditingEMI] = useState<EMI | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    loanAmount: '',
    emiAmount: '',
    dueDate: '',
    startDate: '',
    duration: '',
    interestRate: '',
    category: 'personal' as EMI['category'],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const categoryOptions = [
    { value: 'home', label: 'Home Loan' },
    { value: 'car', label: 'Car Loan' },
    { value: 'personal', label: 'Personal Loan' },
    { value: 'education', label: 'Education Loan' },
    { value: 'other', label: 'Other' },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'EMI name is required';
    if (!formData.loanAmount || parseFloat(formData.loanAmount) <= 0) {
      newErrors.loanAmount = 'Valid loan amount is required';
    }
    if (!formData.emiAmount || parseFloat(formData.emiAmount) <= 0) {
      newErrors.emiAmount = 'Valid EMI amount is required';
    }
    if (!formData.dueDate || parseInt(formData.dueDate) < 1 || parseInt(formData.dueDate) > 31) {
      newErrors.dueDate = 'Due date must be between 1-31';
    }
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.duration || parseInt(formData.duration) <= 0) {
      newErrors.duration = 'Valid duration is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const emiData: Omit<EMI, 'id'> = {
        name: formData.name.trim(),
        loanAmount: parseFloat(formData.loanAmount),
        emiAmount: parseFloat(formData.emiAmount),
        dueDate: parseInt(formData.dueDate),
        startDate: formData.startDate,
        duration: parseInt(formData.duration),
        remainingMonths: parseInt(formData.duration),
        interestRate: formData.interestRate ? parseFloat(formData.interestRate) : undefined,
        category: formData.category,
      };

      // Calculate remaining months based on start date
      const tempEMI = { ...emiData, id: 'temp' } as EMI;
      emiData.remainingMonths = calculateRemainingMonths(tempEMI);

      if (editingEMI) {
        await updateEMIAction({ ...emiData, id: editingEMI.id });
        setEditingEMI(null);
      } else {
        await addEMI(emiData);
        setIsAddingEMI(false);
      }

      resetForm();
    } catch (error) {
      console.error('Error saving EMI:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      loanAmount: '',
      emiAmount: '',
      dueDate: '',
      startDate: '',
      duration: '',
      interestRate: '',
      category: 'personal',
    });
    setErrors({});
  };

  const handleEdit = (emi: EMI) => {
    setFormData({
      name: emi.name,
      loanAmount: emi.loanAmount.toString(),
      emiAmount: emi.emiAmount.toString(),
      dueDate: emi.dueDate.toString(),
      startDate: emi.startDate,
      duration: emi.duration.toString(),
      interestRate: emi.interestRate?.toString() || '',
      category: emi.category,
    });
    setEditingEMI(emi);
    setIsAddingEMI(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this EMI?')) {
      try {
        await deleteEMIAction(id);
      } catch (error) {
        console.error('Error deleting EMI:', error);
      }
    }
  };

  const handleCancel = () => {
    setIsAddingEMI(false);
    setEditingEMI(null);
    resetForm();
  };

  if (state.loading && state.emis.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 mb-2">EMI & Loan Setup</h1>
          <p className="text-slate-400">Manage your EMIs and loan commitments</p>
        </div>
        {!isAddingEMI && (
          <Button onClick={() => setIsAddingEMI(true)} icon={Plus}>
            Add EMI
          </Button>
        )}
      </div>

      {/* Add/Edit EMI Form */}
      {isAddingEMI && (
        <Card>
          <h2 className="text-lg font-semibold text-slate-100 mb-4">
            {editingEMI ? 'Edit EMI' : 'Add New EMI'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="EMI Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={errors.name}
                placeholder="e.g., Home Loan - SBI"
              />
              <Select
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as EMI['category'] })}
                options={categoryOptions}
              />
              <Input
                label="Loan Amount"
                type="number"
                value={formData.loanAmount}
                onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
                error={errors.loanAmount}
                placeholder="500000"
              />
              <Input
                label="EMI Amount"
                type="number"
                value={formData.emiAmount}
                onChange={(e) => setFormData({ ...formData, emiAmount: e.target.value })}
                error={errors.emiAmount}
                placeholder="15000"
              />
              <Input
                label="Due Date (Day of Month)"
                type="number"
                min="1"
                max="31"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                error={errors.dueDate}
                placeholder="15"
              />
              <Input
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                error={errors.startDate}
              />
              <Input
                label="Duration (Months)"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                error={errors.duration}
                placeholder="240"
              />
              <Input
                label="Interest Rate (%)"
                type="number"
                step="0.01"
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                placeholder="8.5"
                helperText="Optional"
              />
            </div>
            <div className="flex space-x-3">
              <Button type="submit" loading={submitting}>
                {editingEMI ? 'Update EMI' : 'Add EMI'}
              </Button>
              <Button type="button" variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* EMI List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-100">Current EMIs</h2>
        {state.emis.length > 0 ? (
          <div className="grid gap-4">
            {state.emis.map((emi) => (
              <Card key={emi.id} className="hover:bg-slate-750 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-slate-700 rounded-lg">
                      <CreditCard className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-100">{emi.name}</h3>
                      <p className="text-sm text-slate-400 capitalize">{emi.category}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-slate-400">
                          Due: {emi.dueDate}{emi.dueDate === 1 ? 'st' : emi.dueDate === 2 ? 'nd' : emi.dueDate === 3 ? 'rd' : 'th'} of every month
                        </span>
                        <span className="text-sm text-slate-400">
                          {calculateRemainingMonths(emi)} months remaining
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold text-slate-100">
                        {formatCurrency(emi.emiAmount)}
                      </p>
                      <p className="text-sm text-slate-400">
                        of {formatCurrency(emi.loanAmount)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(emi)}
                        icon={Edit}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(emi.id)}
                        icon={Trash2}
                      />
                    </div>
                  </div>
                </div>
                {emi.interestRate && (
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <p className="text-sm text-slate-400">
                      Interest Rate: {emi.interestRate}% per annum
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CreditCard className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">No EMIs Added</h3>
            <p className="text-slate-400 mb-4">Start by adding your first EMI or loan</p>
            <Button onClick={() => setIsAddingEMI(true)} icon={Plus}>
              Add Your First EMI
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Setup;