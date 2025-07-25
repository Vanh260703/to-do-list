// cron/handleAllTaskExpiry.js
const cron = require('node-cron');
const User = require('../app/models/User');
const { isAfter } = require('date-fns');

cron.schedule('1 0 * * *', () => {
  const now = new Date();
  const today = now.getDate();
  const dayOfWeek = now.getDay(); // 0 = Chủ Nhật
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  User.find({})
    .then((users) => {
      users.forEach((user) => {
        let updated = false;

        user.todos.forEach((task) => {
          // Reset nhiệm vụ trong ngày (Sau 12h đêm)
          if(task.inDay){
            handleReset(task);
            updated = true;
          }
          // Reset nhiệm vụ trong tuần (Sau CN)
          if(task.inWeek && dayOfWeek === 0){
            handleReset(task);
            updated = true;
          }

          // Reset nhiệm vụ trong tháng: chỉ reset ngày cuối tháng
          if (task.inMonth && today === lastDayOfMonth) {
            handleReset(task);
            updated = true;
          }

        });

        if (updated) {
          user
            .save()
            .then(() => {
              console.log(`[CRON] ✔ Updated user ${user._id}`);
            })
            .catch((err) => {
              console.error(`[CRON] ❌ Lỗi khi save user ${user._id}:`, err.message);
            });
        }
      });

      console.log(`[CRON] ✔ Đã xử lý inDay/inWeek/inMonth lúc ${now.toISOString()}`);
    })
    .catch((err) => {
      console.error('[CRON] ❌ Lỗi khi truy vấn User:', err.message);
    });
});

function handleReset(task){
  if(!task.completed){
    task.status = 'overdue';
    task.isValid = false;
  }else{
    task.deleted = true;
  }

  task.inDay = false;
  task.inWeek = false;
  task.inMonth = false;

}
