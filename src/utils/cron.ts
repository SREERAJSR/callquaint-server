import cron from 'node-cron';
import User from '../models/user.model';

// Schedule a job to run every two minutes
// export default cron.schedule('*/3 * * * *', async () => {
//     // Delete documents where verified is false and expireAt is before the current time
//     await User.deleteMany({ isEmailVerified: false, expireAt: { $lt: new Date() } });
// });
