import cron from 'node-cron';
import { processRecurringTransactions, testTransaction } from './jobs/transaction.job';

const scheduleCronJob = (name:string, time:string, job:Function) => {
    console.log(`Scheduling ${name} job at ${time}`);
    return cron.schedule(time,async()=>{
        try{
            await job();
            console.log(`${name} job completed successfully`);
        }catch(error){
            console.error(`Error running ${name} job: ${error}`);
        }
    },{
        scheduled:true,
        timezone:"UTC"
    }
)
}

export const startJobs = () =>{
    return [
        scheduleCronJob("Test Transaction", "*/1 * * * *", processRecurringTransactions),
    ]

}
