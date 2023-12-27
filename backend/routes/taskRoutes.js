const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

router.post('/:id', taskController.createTask);
router.put('/:userId/:taskId', taskController.updateTaskStatus);
router.delete('/:userId/:taskId',  taskController.deleteTask);
router.get('/:userId', taskController.getTasksByUser);

module.exports = router;
