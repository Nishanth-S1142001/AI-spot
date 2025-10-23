import { Handle, Position } from 'reactflow'
import { Code } from 'lucide-react'

export default function APICallNode({ data, selected }) {
  return (
    <div
      className={`bg-white rounded-lg shadow-lg border-2 ${
        selected ? 'border-blue-500' : 'border-blue-200'
      } min-w-[120px] max-w-[200px] h-fit`}
    >
      <Handle type="target" position={Position.Left} className="w-2 h-2" />

      <div className="p-2">
        <div className="flex items-center space-x-1 mb-1">
          <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
            <Code className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900 text-sm">
              {data.label || 'API Call'}
            </div>
            <div className="text-xs text-gray-500">HTTP Request</div>
          </div>
        </div>

        {data.config?.method && (
          <div className="mt-1 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Method:</span>
              <span
                className={`px-1 py-0.5 rounded font-medium text-[10px] ${
                  data.config.method === 'GET'
                    ? 'bg-green-100 text-green-700'
                    : data.config.method === 'POST'
                    ? 'bg-blue-100 text-blue-700'
                    : data.config.method === 'PUT'
                    ? 'bg-yellow-100 text-yellow-700'
                    : data.config.method === 'DELETE'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {data.config.method}
              </span>
            </div>

            {data.config.url && (
              <div className="text-xs text-gray-600 truncate">
                {data.config.url}
              </div>
            )}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2" />
    </div>
  )
}
