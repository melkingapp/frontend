import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { getManagerTasks, completeManagerTask, selectManagerTasks, selectManagerTasksLoading, selectCompleteTaskLoading } from '../../membership/membershipSlice';
import { CheckCircle, Circle, Clock, AlertCircle, Loader } from 'lucide-react';

export default function ManagerTasksWidget({ buildingId }) {
  const dispatch = useDispatch();
  const tasks = useSelector(selectManagerTasks) || [];
  const loading = useSelector(selectManagerTasksLoading);
  const completing = useSelector(selectCompleteTaskLoading);

  useEffect(() => {
    if (buildingId) {
      dispatch(getManagerTasks(buildingId));
    }
  }, [dispatch, buildingId]);

  const handleCompleteTask = async (taskId) => {
    try {
      await dispatch(completeManagerTask({
        buildingId,
        data: { task_id: taskId }
      })).unwrap();

      toast.success('ماموریت با موفقیت انجام شد!');
    } catch (error) {
      toast.error(error || 'خطا در انجام ماموریت');
    }
  };

  const getTaskIcon = (task) => {
    if (task.is_completed) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else {
      return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTaskStatus = (task) => {
    if (task.is_completed) {
      return <span className="text-sm text-green-600 font-medium">انجام شده</span>;
    } else {
      return <span className="text-sm text-orange-600 font-medium">در انتظار</span>;
    }
  };

  const getTaskTypeText = (taskType) => {
    const typeMap = {
      'complete_building_info': 'تکمیل اطلاعات ساختمان',
      'add_units': 'اضافه کردن واحدها',
      'add_financial_info': 'اضافه کردن اطلاعات مالی'
    };
    return typeMap[taskType] || taskType;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">ماموریت‌های مدیر</h3>
        </div>
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const completedTasks = tasks.filter(task => task.is_completed).length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">ماموریت‌های مدیر</h3>
        </div>
        <div className="text-sm text-gray-600">
          {completedTasks} از {totalTasks} انجام شده
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {Math.round(progress)}% تکمیل شده
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-6">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-gray-600">همه ماموریت‌ها تکمیل شده!</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.manager_task_id}
              className={`flex items-start justify-between p-3 rounded-lg border transition-colors ${
                task.is_completed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-start gap-3">
                {getTaskIcon(task)}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{task.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {getTaskStatus(task)}
                    <span className="text-xs text-gray-500">
                      {getTaskTypeText(task.task_type)}
                    </span>
                  </div>
                </div>
              </div>

              {!task.is_completed && (
                <button
                  onClick={() => handleCompleteTask(task.manager_task_id)}
                  disabled={completing}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {completing ? (
                    <>
                      <Loader className="w-3 h-3 animate-spin" />
                      در حال انجام...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3 h-3" />
                      انجام شد
                    </>
                  )}
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {tasks.length > 0 && completedTasks === totalTasks && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">تبریک! همه ماموریت‌های اولیه تکمیل شده</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            اکنون می‌توانید از تمام امکانات سیستم استفاده کنید.
          </p>
        </div>
      )}
    </div>
  );
}
