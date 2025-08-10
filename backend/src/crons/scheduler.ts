import cron from 'node-cron';
import { processRecurringTransactions, testTransaction } from './jobs/transaction.job';
import { processReportJob } from './jobs/report.job';

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
        scheduleCronJob("Recurring CRON Transaction", "0 5 * * *", processRecurringTransactions),

        // Runs 2:30 am at every 1st day of the month
        scheduleCronJob("Recurring Report Job ", "30 2 1 * *", processReportJob),
    ]

}
