'use client'

import { useState, useEffect } from 'react'
import Button from '../../ui/button'
import FormInput from '../../ui/formInputField'
import toast from 'react-hot-toast'

export default function IntegrationConfig({ config, onSave, onClose }) {
  const [integrations, setIntegrations] = useState([])
  const [selectedIntegration, setSelectedIntegration] = useState(
    config?.integrationId || ''
  )
  const [action, setAction] = useState(config?.action || '')
  const [parameters, setParameters] = useState(config?.parameters || {})

  useEffect(() => {
    fetchIntegrations()
  }, [])

  useEffect(() => {
    setSelectedIntegration(config?.integrationId || '')
    setAction(config?.action || '')
    setParameters(config?.parameters || {})
  }, [config])

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('/api/integrations')
      const data = await response.json()
      setIntegrations(data.integrations || [])
    } catch (error) {
      console.error('Error fetching integrations:', error)
    }
  }

  const getActionsForType = (integrationType) => {
    const actions = {
      razorpay: [
        { value: 'create_order', label: 'Create Order' },
        { value: 'capture_payment', label: 'Capture Payment' },
        { value: 'create_refund', label: 'Create Refund' },
        { value: 'get_payment', label: 'Get Payment' }
      ],
      zoho_crm: [
        { value: 'create_lead', label: 'Create Lead' },
        { value: 'create_contact', label: 'Create Contact' },
        { value: 'create_deal', label: 'Create Deal' },
        { value: 'update_record', label: 'Update Record' },
        { value: 'search_records', label: 'Search Records' }
      ],
      shopify: [
        { value: 'create_order', label: 'Create Order' },
        { value: 'get_order', label: 'Get Order' },
        { value: 'update_order', label: 'Update Order' },
        { value: 'create_product', label: 'Create Product' },
        { value: 'update_inventory', label: 'Update Inventory' }
      ],
      stripe: [
        { value: 'create_payment_intent', label: 'Create Payment Intent' },
        { value: 'create_customer', label: 'Create Customer' },
        { value: 'create_subscription', label: 'Create Subscription' },
        { value: 'create_refund', label: 'Create Refund' }
      ],
      sendgrid: [{ value: 'send_email', label: 'Send Email' }]
    }

    return actions[integrationType] || []
  }

  const selectedIntegrationData = integrations.find(
    (i) => i.id === selectedIntegration
  )
  const availableActions = selectedIntegrationData
    ? getActionsForType(selectedIntegrationData.integration_type)
    : []

  const handleSave = () => {
    if (!selectedIntegration) {
      toast.error('Please select an integration')
      return
    }
    if (!action) {
      toast.error('Please select an action')
      return
    }

    onSave({
      integrationId: selectedIntegration,
      integrationType: selectedIntegrationData?.integration_type,
      action,
      parameters
    })
  }

  const updateParameter = (key, value) => {
    setParameters((prev) => ({ ...prev, [key]: value }))
  }

  const getParameterFields = () => {
    if (!action) return []

    const paramFields = {
      // Razorpay
      create_order: [
        { key: 'amount', label: 'Amount', placeholder: '{{trigger_1.amount}}' },
        { key: 'currency', label: 'Currency', placeholder: 'INR' },
        { key: 'receipt', label: 'Receipt ID', placeholder: 'order_{{trigger_1.orderId}}' }
      ],
      capture_payment: [
        { key: 'paymentId', label: 'Payment ID', placeholder: '{{trigger_1.paymentId}}' },
        { key: 'amount', label: 'Amount', placeholder: '{{trigger_1.amount}}' }
      ],
      create_refund: [
        { key: 'paymentId', label: 'Payment ID', placeholder: '{{trigger_1.paymentId}}' },
        { key: 'amount', label: 'Amount (optional)', placeholder: 'Full refund if empty' }
      ],
      // Zoho CRM
      create_lead: [
        { key: 'firstName', label: 'First Name', placeholder: '{{trigger_1.firstName}}' },
        { key: 'lastName', label: 'Last Name', placeholder: '{{trigger_1.lastName}}' },
        { key: 'email', label: 'Email', placeholder: '{{trigger_1.email}}' },
        { key: 'company', label: 'Company', placeholder: '{{trigger_1.company}}' },
        { key: 'phone', label: 'Phone', placeholder: '{{trigger_1.phone}}' }
      ],
      create_contact: [
        { key: 'firstName', label: 'First Name', placeholder: '{{trigger_1.firstName}}' },
        { key: 'lastName', label: 'Last Name', placeholder: '{{trigger_1.lastName}}' },
        { key: 'email', label: 'Email', placeholder: '{{trigger_1.email}}' },
        { key: 'phone', label: 'Phone', placeholder: '{{trigger_1.phone}}' }
      ],
      // Shopify
      create_order: [
        { key: 'lineItems', label: 'Line Items (JSON)', placeholder: '[{"title": "Product", "quantity": 1}]' }
      ],
      get_order: [
        { key: 'orderId', label: 'Order ID', placeholder: '{{trigger_1.orderId}}' }
      ],
      // Stripe
      create_payment_intent: [
        { key: 'amount', label: 'Amount', placeholder: '{{trigger_1.amount}}' },
        { key: 'currency', label: 'Currency', placeholder: 'usd' }
      ],
      create_customer: [
        { key: 'email', label: 'Email', placeholder: '{{trigger_1.email}}' },
        { key: 'name', label: 'Name', placeholder: '{{trigger_1.name}}' }
      ],
      // SendGrid
      send_email: [
        { key: 'from', label: 'From Email', placeholder: 'noreply@example.com' },
        { key: 'to', label: 'To Email', placeholder: '{{trigger_1.email}}' },
        { key: 'subject', label: 'Subject', placeholder: 'Order Confirmation' },
        { key: 'text', label: 'Text Content', placeholder: 'Email body...' }
      ]
    }

    return paramFields[action] || []
  }

  return (
    <div className='space-y-4 overflow-y-auto custom-scrollbar max-h-[60vh]'>
      {/* Integration select */}
      <div>
        <label className='mb-2 block text-sm font-medium text-neutral-400'>
          Select Integration *
        </label>
        <select
          value={selectedIntegration}
          onChange={(e) => {
            setSelectedIntegration(e.target.value)
            setAction('')
            setParameters({})
          }}
          className='w-full rounded-lg bg-neutral-900 px-3 py-2'
        >
          <option value=''>Choose an integration...</option>
          {integrations.map((integration) => (
            <option key={integration.id} value={integration.id}>
              {integration.name} ({integration.integration_type})
            </option>
          ))}
        </select>
        {integrations.length === 0 && (
          <p className='mt-1 text-xs text-neutral-500'>
            No integrations configured. Add one in Settings.
          </p>
        )}
      </div>

      {/* Action select */}
      {selectedIntegration && (
        <div>
          <label className='mb-2 block text-sm font-medium text-neutral-400'>
            Action *
          </label>
          <select
            value={action}
            onChange={(e) => {
              setAction(e.target.value)
              setParameters({})
            }}
            className='w-full rounded-lg bg-neutral-900 px-3 py-2'
          >
            <option value=''>Choose an action...</option>
            {availableActions.map((act) => (
              <option key={act.value} value={act.value}>
                {act.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Parameters */}
      {action &&
        getParameterFields().map((field) => (
          <div key={field.key}>
            <label className='mb-2 block text-sm font-medium text-neutral-400'>
              {field.label}
            </label>
            <FormInput
              value={parameters[field.key] || ''}
              onChange={(e) => updateParameter(field.key, e.target.value)}
              placeholder={field.placeholder}
            />
          </div>
        ))}

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
