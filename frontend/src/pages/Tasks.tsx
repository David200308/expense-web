import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Clock, Play, Pause, Mail } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getCategoryIcon } from '@/utils/categoryIcons'
import { useCurrency } from '@/contexts/CurrencyContext'
import TaskForm from '@/components/TaskForm'
import TaskModal from '@/components/TaskModal'

interface Task {
  id: string
  user_id: string
  title: string
  description: string
  amount: number
  category: string
  schedule: string
  is_active: boolean
  last_run: string | null
  next_run: string
  created_at: string
  updated_at: string
}

const Tasks: React.FC = () => {
  const { user } = useAuth()
  const { formatAmount } = useCurrency()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  useEffect(() => {
    if (user?.id) {
      fetchTasks()
    }
  }, [user])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${(window as any).APP_CONFIG?.TASK_SCHEDULER_URL || import.meta.env.VITE_TASK_SCHEDULER_URL || 'http://localhost:3030'}/api/v1/tasks/${user?.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch tasks')
      }
      const data = await response.json()
      setTasks(data.tasks || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (taskData: { title: string; description: string; amount: number; category: string; schedule: string; is_active: boolean }) => {
    try {
      const response = await fetch(`${(window as any).APP_CONFIG?.TASK_SCHEDULER_URL || import.meta.env.VITE_TASK_SCHEDULER_URL || 'http://localhost:3030'}/api/v1/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...taskData,
          user_id: user?.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create task')
      }

      await fetchTasks() // Refresh the list
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task')
    }
  }

  const handleUpdateTask = async (taskData: Omit<Task, 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch(`${(window as any).APP_CONFIG?.TASK_SCHEDULER_URL || import.meta.env.VITE_TASK_SCHEDULER_URL || 'http://localhost:3030'}/api/v1/tasks/${taskData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      })

      if (!response.ok) {
        throw new Error('Failed to update task')
      }

      await fetchTasks() // Refresh the list
      setEditingTask(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task')
    }
  }

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return
    }

    try {
      const response = await fetch(`${(window as any).APP_CONFIG?.TASK_SCHEDULER_URL || import.meta.env.VITE_TASK_SCHEDULER_URL || 'http://localhost:3030'}/api/v1/tasks/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete task')
      }

      await fetchTasks() // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task')
    }
  }

  const handleToggleTask = async (task: Task) => {
    try {
      const response = await fetch(`${(window as any).APP_CONFIG?.TASK_SCHEDULER_URL || import.meta.env.VITE_TASK_SCHEDULER_URL || 'http://localhost:3030'}/api/v1/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...task,
          is_active: !task.is_active,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update task')
      }

      await fetchTasks() // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task')
    }
  }

  const handleTriggerTask = async (id: string) => {
    try {
      const response = await fetch(`${(window as any).APP_CONFIG?.TASK_SCHEDULER_URL || import.meta.env.VITE_TASK_SCHEDULER_URL || 'http://localhost:3030'}/api/v1/tasks/${id}/trigger`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to trigger task')
      }

      await fetchTasks() // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger task')
    }
  }

  const formatSchedule = (schedule: string) => {
    // Convert cron expression to human readable format
    const scheduleMap: { [key: string]: string } = {
      '0 9 * * 1': 'Every Monday at 9:00 AM',
      '0 9 * * 2': 'Every Tuesday at 9:00 AM',
      '0 9 * * 3': 'Every Wednesday at 9:00 AM',
      '0 9 * * 4': 'Every Thursday at 9:00 AM',
      '0 9 * * 5': 'Every Friday at 9:00 AM',
      '0 9 * * 6': 'Every Saturday at 9:00 AM',
      '0 9 * * 0': 'Every Sunday at 9:00 AM',
      '0 9 * * *': 'Every day at 9:00 AM',
      '0 9 1 * *': 'Every month on the 1st at 9:00 AM',
    }
    return scheduleMap[schedule] || schedule
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expense Tasks</h1>
          <p className="text-gray-600">Schedule recurring expense reminders</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Task</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {!user?.email && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-yellow-600" />
            <p className="text-yellow-800">
              Please bind your email in Settings to receive task notifications.
            </p>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="card">
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No tasks yet. Create your first expense reminder!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => {
              const categoryIcon = getCategoryIcon(task.category)
              return (
                <div key={task.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {React.createElement(categoryIcon.icon, {
                        className: `h-5 w-5 ${categoryIcon.color}`
                      })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900 truncate">{task.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          task.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {task.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{task.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                        <span>{formatAmount(task.amount)}</span>
                        <span>•</span>
                        <span>{task.category}</span>
                        <span>•</span>
                        <span>{formatSchedule(task.schedule)}</span>
                        {task.next_run && (
                          <>
                            <span>•</span>
                            <span>Next: {new Date(task.next_run).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleTriggerTask(task.id)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                      title="Trigger now"
                    >
                      <Play className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleTask(task)}
                      className={`p-2 transition-colors duration-200 ${
                        task.is_active 
                          ? 'text-gray-400 hover:text-yellow-600' 
                          : 'text-gray-400 hover:text-green-600'
                      }`}
                      title={task.is_active ? 'Pause task' : 'Activate task'}
                    >
                      {task.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => setEditingTask(task)}
                      className="p-2 text-gray-400 hover:text-primary-600 transition-colors duration-200"
                      title="Edit task"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                      title="Delete task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Forms */}
      {showForm && (
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingTask && (
        <TaskModal
          task={editingTask}
          onSave={handleUpdateTask}
          onCancel={() => setEditingTask(null)}
        />
      )}
    </div>
  )
}

export default Tasks
