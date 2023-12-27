const Task = require('../models/taskModel');
const User = require('../models/userModel');

//To create task
exports.createTask = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const createdBy = req.params.id; 

    const task = new Task({ title, description, createdBy });
    await task.save();
    req.io.emit('taskCreated', { task });

    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    next(error);
  }
};

//To update task with role base access controlle
exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { userId, taskId } = req.params;
    const { status } = req.body;

    // Find the user to check their role
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      // Admins have full access to update task status
      const task = await Task.findById(taskId);

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      // Update the task's status
      task.status = status;
      await task.save();

      req.io.emit('taskUpdated', { taskId, status });

      return res.status(200).json({ message: 'Task status updated successfully', task });
    } else if (user.role === 'regular') {
      // Regular users can only update tasks that they own
      const task = await Task.findById(taskId);

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      if (user._id.equals(task.createdBy)) {
        // Check if the user's ID matches the createdBy field of the task
        task.status = status;
        await task.save();

        req.io.emit('taskUpdated', { taskId, status });

        return res.status(200).json({ message: 'Task status updated successfully', task });
      } else {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
  } catch (error) {
    next(error);
  }
};

//To delete task with role base access controlle
exports.deleteTask = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const taskId = req.params.taskId;

    // Find the user to check their role
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      // Admins have full access to delete tasks
      const task = await Task.findByIdAndDelete(taskId);

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      req.io.emit('taskDeleted', { taskId });

      return res.status(200).json({ message: 'Task deleted successfully' });
    } else if (user.role === 'regular') {
      // Regular users can only delete tasks that they own
      const task = await Task.findById(taskId);

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      if (user._id.equals(task.createdBy)) {
        // Check if the user's ID matches the createdBy field of the task
        await Task.findByIdAndDelete(taskId);

        req.io.emit('taskDeleted', { taskId });

        return res.status(200).json({ message: 'Task deleted successfully' });
      } else {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
  } catch (error) {
    next(error);
  }
};

//To get user task
exports.getTasksByUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const tasks = await Task.find({ createdBy: userId });

    if (!tasks || tasks.length === 0) {
      return res.status(404).json({ message: 'No tasks found for this user' });
    }
    res.status(200).json({ tasks });
  } catch (error) {
    next(error);
  }
};

