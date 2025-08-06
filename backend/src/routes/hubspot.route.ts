import { Router } from "express";
import { loginController, registerController } from "../controllers/auth.controller";
import { fetchAllHubSpotDeals, GetAllDealsOptions } from "../services/hubspot.service";
import { Env } from "../config/env.config";
import axios from "axios";
const crypto = require('crypto');


const hubSpotRoute = Router();

hubSpotRoute.get("/hubspot-deals", async (req, res) => {
  try {
    console.log(Env.HUBSPOT_TOKEN);
    const deals = await fetchAllHubSpotDeals(Env.HUBSPOT_TOKEN, {});
    res.json(deals);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch HubSpot deals" });
  }
});

hubSpotRoute.post("/webhook/hubspot", async (req, res) => {
    console.log("✅✅✅✅✅✅ Webhook received!");
    try {
        const signature = req.get('X-HubSpot-Signature-v3');
        const body = req.body;
        console.log("Signature: ", signature);
        console.log("Body: ", typeof body);

        if(!body){
            console.log('❌ No webhook payload received');
            return res.status(400).send('Bad Request');
        }
    
        // Verify webhook signature (recommended for production)
        console.log('Verifying webhook signature...');
        // try{
        //     const rawBody= body.toString();
        //     if (Env.WEBHOOK_SECRET && signature) {
        //         if (!verifyWebhookSignature(rawBody, signature, Env.WEBHOOK_SECRET)) {
        //           console.log('❌ Invalid webhook signature');
        //           return res.status(401).send('Unauthorized');
        //         }
        //       }
        // }catch(error){
        //     console.log('❌ Error verifying webhook signature:', error);
        //     return res.status(401).send('Unauthorized silly');
        // }
        
    
        // Parse the webhook payload
        console.log('Parsing webhook payload...');
        // const events = JSON.parse(body.toString());
        
        
        // Process each event
        for (const event of body) {
          console.log('\n--- Processing Event ---');
          console.log('Subscription Type:', event.subscriptionType);
          console.log('Object ID:', event.objectId);
          
          if (event.subscriptionType === 'deal.creation') {
            // Handle new deal creation
            console.log('🔥 Processing new deal creation...');
            
            // Get complete deal details
            const dealDetails = await getDealDetails(event.objectId);
            
            if (dealDetails) {
              // Get associated contacts and company
              const [contacts, company] = await Promise.all([
                getDealContacts(event.objectId),
                getDealCompany(event.objectId)
              ]);
              
              // Prepare deal data for your custom function
              const dealData = {
                dealId: event.objectId,
                dealName: dealDetails.properties.dealname || 'Unnamed Deal',
                amount: dealDetails.properties.amount || '0',
                currency: dealDetails.properties.deal_currency_code || 'USD',
                stage: dealDetails.properties.dealstage || 'Unknown',
                pipeline: dealDetails.properties.pipeline || 'Default',
                closeDate: dealDetails.properties.closedate,
                createDate: dealDetails.properties.createdate,
                assignedTo: dealDetails.properties.hubspot_owner_id,
                contacts: contacts,
                company: company,
                rawData: dealDetails.properties // Full raw data if needed
              };
              
              // Call your custom function
              await handleNewDealCreated(dealData);
            }
            
          } else if (event.subscriptionType === 'deal.propertyChange') {
            // Handle deal property changes
            console.log('📝 Processing deal property change...');
            console.log('Property Name:', event.propertyName);
            console.log('Property Value:', event.propertyValue);
            
            // Call your custom function
            await handleDealPropertyChange(
              event.objectId,
              event.propertyName,
              event.propertyValue,
              event.previousValue || null
            );
          }
        }
    
        // Always respond with 200 to acknowledge receipt
        res.status(200).send('OK');
        
      } catch (error) {
        console.error('❌ Error processing webhook:', error);
        res.status(500).send('Internal Server Error');
      }
  
})

async function getDealDetails(dealId:any) {
    try {
      const response = await axios.get(
        `https://api.hubapi.com/crm/v3/objects/deals/${dealId}`,
        {
          headers: {
            'Authorization': `Bearer ${Env.HUBSPOT_TOKEN}`,
            'Content-Type': 'application/json'
          },
          params: {
            properties: [
              'dealname',
              'amount',
              'dealstage',
              'pipeline',
              'closedate',
              'createdate',
              'hubspot_owner_id',
              'deal_currency_code'
            ]
          }
        }
      );
      return response.data;
    } catch (error:any) {
      console.error('Error fetching deal details:', error.response?.data || error.message);
      return null;
    }
  }
  
  // Function to get associated contacts for a deal
  async function getDealContacts(dealId:string) {
    try {
      const response = await axios.get(
        `https://api.hubapi.com/crm/v3/objects/deals/${dealId}/associations/contacts`,
        {
          headers: {
            'Authorization': `Bearer ${Env.HUBSPOT_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data.results;
    } catch (error:any) {
      console.error('Error fetching deal contacts:', error.response?.data || error.message);
      return [];
    }
  }
  
  // Function to get associated company for a deal
  async function getDealCompany(dealId:string) {
    try {
      const response = await axios.get(
        `https://api.hubapi.com/crm/v3/objects/deals/${dealId}/associations/companies`,
        {
          headers: {
            'Authorization': `Bearer ${Env.HUBSPOT_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data.results[0] || null; // Return first company
    } catch (error:any) {
      console.error('Error fetching deal company:', error.response?.data || error.message);
      return null;
    }
  }

async function handleNewDealCreated(dealData:any) {
    console.log('🎉 NEW DEAL CREATED!');
    console.log('Deal ID:', dealData.dealId);
    console.log('Deal Name:', dealData.dealName);
    console.log('Amount:', dealData.amount);
    console.log('Stage:', dealData.stage);
    console.log('Pipeline:', dealData.pipeline);
    
    // YOUR CUSTOM BUSINESS LOGIC HERE
    try {
      // Example 1: Save to your database
      // await saveDealToDatabase(dealData);
      
      // Example 2: Send notification to your team
      // await sendSlackNotification(`New deal created: ${dealData.dealName} - $${dealData.amount}`);
      
      // Example 3: Create task or follow-up
      // await createFollowUpTask(dealData.dealId, dealData.assignedTo);
      
      // Example 4: Update your CRM or other systems
      // await syncWithExternalCRM(dealData);
      
      // Example 5: Send welcome email to contact
      // if (dealData.contacts.length > 0) {
      //   await sendWelcomeEmail(dealData.contacts[0].email, dealData.dealName);
      // }
      
      console.log('✅ New deal processing completed successfully');
      
    } catch (error) {
      console.error('❌ Error processing new deal:', error);
      // You might want to implement retry logic or error notifications here
    }
  }

async function handleDealPropertyChange(dealId:string, propertyName:string, newValue:string, oldValue:string) {
    console.log('📝 DEAL PROPERTY CHANGED!');
    console.log('Deal ID:', dealId);
    console.log('Property:', propertyName);
    console.log('Old Value:', oldValue);
    console.log('New Value:', newValue);
    
    // Handle specific property changes
    switch (propertyName) {
      case 'dealstage':
        console.log(`Deal ${dealId} moved to stage: ${newValue}`);
        // await handleDealStageChange(dealId, newValue, oldValue);
        break;
        
      case 'amount':
        console.log(`Deal ${dealId} amount changed to: ${newValue}`);
        // await handleDealAmountChange(dealId, newValue, oldValue);
        break;
        
      case 'hubspot_owner_id':
        console.log(`Deal ${dealId} assigned to new owner: ${newValue}`);
        // await handleDealOwnerChange(dealId, newValue, oldValue);
        break;
        
      default:
        console.log(`Deal ${dealId} property ${propertyName} updated`);
    }
  }

function verifyWebhookSignature(body:any, signature:any, secret:any) {
    if (!secret || !signature) return true; // Skip verification if not configured
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

export default hubSpotRoute;
