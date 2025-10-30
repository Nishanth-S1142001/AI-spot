'use client'

import { useState, useEffect } from 'react'
import Button from '../../ui/button'
import FormInput from '../../ui/formInputField'
import toast from 'react-hot-toast'
import { Plus, Trash2 } from 'lucide-react'

export default function APICallConfig({ config, onSave, onClose }) {
  const [method, setMethod] = useState(config?.method || 'GET')
  const [url, setUrl] = useState(config?.url || '')
  const [headers, setHeaders] = useState(
    config?.headers || [{ key: '', value: '' }] 
  )
  const [body, setBody] = useState(config?.body || '')
  const [responseType, setResponseType] = useState(
    config?.responseType || 'json'
  )

  // Sync state with incoming config when node changes
  useEffect(() => {
    setMethod(config?.method || 'GET')
    setUrl(config?.url || '')
    setHeaders(config?.headers || [{ key: '', value: '' }])
    setBody(config?.body || '')
    setResponseType(config?.responseType || 'json')
  }, [config])

  const handleSave = () => {
    if (!url) {
      toast.error('Please enter a URL')
      return
    }

    const headerObj = {}
    headers.forEach((h) => {
      if (h.key && h.value) {
        headerObj[h.key] = h.value
      }
    })

    onSave({
      method,
      url,
      headers: headerObj,
      body: body ? JSON.parse(body) : undefined,
      responseType
    })
  }

  const addHeader = () => setHeaders([...headers, { key: '', value: '' }])
  const updateHeader = (index, field, value) => {
    const newHeaders = [...headers]
    newHeaders[index][field] = value
    setHeaders(newHeaders)
  }
  const removeHeader = (index) =>
    setHeaders(headers.filter((_, i) => i !== index))

  return (
    <div className='custom-scrollbar space-y-4 overflow-y-auto'>
      <div>
        <label className='mb-2 block text-sm font-medium text-neutral-400'>
          HTTP Method *
        </label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className='w-full rounded-lg bg-neutral-900 px-3 py-2'
        >
          <option value='GET'>GET</option>
          <option value='POST'>POST</option>
          <option value='PUT'>PUT</option>
          <option value='PATCH'>PATCH</option>
          <option value='DELETE'>DELETE</option>
        </select>
      </div>

      <div>
        <label className='mb-2 block text-sm font-medium text-neutral-400'>
          URL *
        </label>
        <FormInput
          className='w-full'
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder='https://api.example.com/endpoint'
        />
      </div>

      <div>
        <div className='mb-2 flex items-center justify-between'>
          <label className='block text-lg font-medium text-neutral-400'>
            Headers
          </label>
          <Button
            variant='ghost'
            size='sm'
            className='flex flex-row items-center justify-center'
            onClick={addHeader}
          >
            <Plus className='mr-1 h-4 w-4' /> <span>Add</span>
          </Button>
        </div>
        <div className='space-y-2'>
          {headers.map((header, index) => (
            <div key={index} className='space-y-1'>
              <div className='flex w-full flex-col justify-between space-x-2'>
                <FormInput
                  value={header.key}
                  onChange={(e) => updateHeader(index, 'key', e.target.value)}
                  placeholder='Key'
                  className='flex'
                />
                <FormInput
                  value={header.value}
                  onChange={(e) => updateHeader(index, 'value', e.target.value)}
                  placeholder='Value'
                  className='flex'
                />
              </div>

              <div className='flex justify-end'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => removeHeader(index)}
                >
                  <Trash2 className='h-4 w-4 text-red-600' />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {method !== 'GET' && (
        <div>
          <label className='mb-2 block text-sm font-medium text-neutral-400'>
            Request Body (JSON)
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className='w-full rounded-lg bg-neutral-800 px-3 py-2 font-mono text-sm'
            rows='6'
            placeholder='{\n  "key": "value"\n}'
          />
        </div>
      )}

      <div>
        <label className='mb-2 block text-sm font-medium text-neutral-400'>
          Response Type
        </label>
        <select
          value={responseType}
          onChange={(e) => setResponseType(e.target.value)}
          className='w-full rounded-lg bg-neutral-900 px-3 py-2'
        >
          <option value='json'>JSON</option>
          <option value='text'>Text</option>
          <option value='none'>None</option>
        </select>
      </div>

      <div className='flex justify-between space-x-3 pt-4'>
        <Button variant='outline' onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Submit</Button>
      </div>
    </div>
  )
}
