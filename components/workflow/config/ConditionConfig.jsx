'use client'

import { useState, useEffect } from 'react'
import Button from '../../ui/button'
import FormInput from '../../ui/formInputField'
import toast from 'react-hot-toast'
import { Plus, Trash2 } from 'lucide-react'

export default function ConditionConfig({ config, onSave, onClose }) {
  const [conditions, setConditions] = useState(
    config?.conditions || [{ field: '', operator: 'equals', value: '' }]
  )
  const [logicType, setLogicType] = useState(config?.logicType || 'AND')

  const operators = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Does Not Contain' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'exists', label: 'Exists' },
    { value: 'not_exists', label: 'Does Not Exist' }
  ]

  // Sync state when config changes
  useEffect(() => {
    setConditions(config?.conditions || [{ field: '', operator: 'equals', value: '' }])
    setLogicType(config?.logicType || 'AND')
  }, [config])

  const handleSave = () => {
    if (conditions.length === 0 || !conditions[0].field) {
      toast.error('Please add at least one condition')
      return
    }

    onSave({ conditions, logicType })
  }

  const addCondition = () => {
    setConditions([...conditions, { field: '', operator: 'equals', value: '' }])
  }

  const updateCondition = (index, field, value) => {
    const newConditions = [...conditions]
    newConditions[index][field] = value
    setConditions(newConditions)
  }

  const removeCondition = (index) => {
    setConditions(conditions.filter((_, i) => i !== index))
  }

  return (
    <div className='space-y-4 overflow-y-auto custom-scrollbar max-h-[60vh]'>
      {/* Logic Type */}
      <div>
        <label className='mb-2 block text-sm font-medium text-neutral-400'>
          Logic Type
        </label>
        <select
          value={logicType}
          onChange={(e) => setLogicType(e.target.value)}
          className='w-full rounded-lg bg-neutral-900 px-3 py-2'
        >
          <option value='AND'>AND (All conditions must be true)</option>
          <option value='OR'>OR (Any condition can be true)</option>
        </select>
      </div>

      {/* Conditions List */}
      <div>
        <div className='mb-2 flex items-center justify-between'>
          <label className='block text-lg font-medium text-neutral-400'>
            Conditions
          </label>
          <Button
            variant='ghost'
            size='sm'
            className='flex items-center justify-center'
            onClick={addCondition}
          >
            <Plus className='mr-1 h-4 w-4' /> Add
          </Button>
        </div>

        <div className='space-y-3'>
          {conditions.map((condition, index) => (
            <div key={index} className='rounded-lg border border-neutral-700 p-3 space-y-10'>
              <FormInput
                placeholder='Input Field path (e.g., trigger_1.amount)'
                value={condition.field}
                onChange={(e) => updateCondition(index, 'field', e.target.value)}
                className='w-full '
              />

              <select
                value={condition.operator}
                onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                className='w-full rounded-lg bg-neutral-900 px-3 py-2'
              >
                {operators.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>

              {condition.operator !== 'exists' && condition.operator !== 'not_exists' && (
                <FormInput
                  placeholder='Input value'
                  value={condition.value}
                  onChange={(e) => updateCondition(index, 'value', e.target.value)}
                  className='w-full'
                />
              )}

              <div className='flex justify-end'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => removeCondition(index)}
                >
                  <Trash2 className='h-4 w-4 text-red-600' />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tip Box */}
      <div className='rounded-lg border border-blue-800 bg-blue-950 p-3'>
        <p className='text-sm text-blue-300'>
          <strong>Tip:</strong> Use dot notation to access nested fields. For example:{' '}
          <code className='ml-1 rounded bg-blue-900 px-1'>trigger_1.order.amount</code>
        </p>
      </div>

      {/* Actions */}
      <div className='flex justify-between space-x-3   pt-4'>
        <Button variant='outline' onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Submit</Button>
      </div>
    </div>
  )
}
