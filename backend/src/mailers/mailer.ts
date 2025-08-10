import { Env } from "../config/env.config";
import { resendConfig as resend } from "../config/resend.config";

type Params = {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
  from?: string;
};

const mailer_sender = `Finance App - <${Env.RESEND_EMAIL_SENDER}>`;

export const sendEmail = async ({
  to,
  from = mailer_sender,
  subject,
  text,
  html,
}: Params) => {

    console.log("😈😈😈preparing to send email to ", to," from : ",from," subject : ",subject)
  return await resend.emails.send({
    from,
    to: Array.isArray(to) ? to : [to],
    text,
    subject,
    html,
  });
};
