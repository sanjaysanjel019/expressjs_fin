import axios, { AxiosResponse } from 'axios';

// Types and Interfaces
interface HubSpotDealProperties {
  dealname?: string;
  amount?: string;
  dealstage?: string;
  pipeline?: string;
  closedate?: string;
  createdate: string;
  hs_lastmodifieddate: string;
  hubspot_owner_id?: string;
  deal_currency_code?: string;
  [key: string]: string | undefined; // Allow for additional properties
}

interface HubSpotDeal {
  id: string;
  properties: HubSpotDealProperties;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

interface HubSpotPaging {
  next?: {
    after: string;
    link?: string;
  };
  prev?: {
    before: string;
    link?: string;
  };
}

interface HubSpotDealsResponse {
  results: HubSpotDeal[];
  paging?: HubSpotPaging;
  total?: number;
}

interface HubSpotAssociation {
  id: string;
  type: string;
}

interface HubSpotAssociationsResponse {
  results: HubSpotAssociation[];
  paging?: HubSpotPaging;
}

interface FormattedDeal {
  id: string;
  name: string;
  amount: number;
  currency: string;
  stage: string;
  pipeline: string;
  closeDate: Date | null;
  createDate: Date;
  lastModified: Date;
  ownerId: string | null;
  rawProperties: HubSpotDealProperties;
}

interface FilterOption {
  propertyName: string;
  operator: 'EQ' | 'NEQ' | 'LT' | 'LTE' | 'GT' | 'GTE' | 'BETWEEN' | 'IN' | 'NOT_IN' | 'HAS_PROPERTY' | 'NOT_HAS_PROPERTY' | 'CONTAINS_TOKEN' | 'NOT_CONTAINS_TOKEN';
  value: string | number;
}

interface FilterGroup {
  filters: FilterOption[];
}

interface SearchPayload {
  filterGroups?: FilterGroup[];
  properties: string[];
  limit: number;
  after?: string;
  sorts?: Array<{
    propertyName: string;
    direction: 'ASCENDING' | 'DESCENDING';
  }>;
}

interface GetAllDealsOptions {
  properties?: string[];
  limit?: number;
  includeAssociations?: boolean;
}

interface DealsStats {
  totalDeals: number;
  totalValue: number;
  stageBreakdown: Record<string, number>;
  averageDealValue: number;
}

class HubSpotDealsAPI {
  private readonly accessToken: string;
  private readonly baseURL: string = 'https://api.hubapi.com/crm/v3/objects/deals';
  private readonly defaultProperties: string[] = [
    'dealname',
    'amount',
    'dealstage',
    'pipeline',
    'closedate',
    'createdate',
    'hs_lastmodifieddate',
    'hubspot_owner_id',
    'deal_currency_code'
  ];

  constructor(accessToken: string) {
    if (!accessToken) {
      throw new Error('HubSpot access token is required');
    }
    this.accessToken = accessToken;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  private async makeRequest<T>(
    method: 'GET' | 'POST',
    url: string,
    data?: any,
    params?: Record<string, any>
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await axios({
        method,
        url,
        headers: this.getHeaders(),
        data,
        params
      });
      return response.data;
    } catch (error: any) {
      console.error('❌ HubSpot API Error:', error.response?.data || error.message);
      throw new Error(`HubSpot API request failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // Fetch all deals with pagination
  async getAllDeals(options: GetAllDealsOptions = {}): Promise<HubSpotDeal[]> {
    const {
      properties = this.defaultProperties,
      limit = 100,
      includeAssociations = false
    } = options;

    let allDeals: HubSpotDeal[] = [];
    let after: string | undefined = undefined;
    let hasMore: boolean = true;

    console.log('🔄 Starting to fetch all deals from HubSpot...');

    try {
      while (hasMore) {
        const params: Record<string, any> = {
          limit,
          properties: properties.join(',')
        };

        if (after) {
          params.after = after;
        }

        if (includeAssociations) {
          params.associations = 'contacts,companies';
        }

        console.log(`📥 Fetching batch of ${limit} deals...`);

        const response = await this.makeRequest<HubSpotDealsResponse>(
          'GET',
          this.baseURL,
          undefined,
          params
        );

        const { results, paging } = response;
        
        // Add current batch to all deals
        allDeals = allDeals.concat(results);
        
        console.log(`✅ Fetched ${results.length} deals. Total so far: ${allDeals.length}`);

        // Check if there are more pages
        if (paging?.next?.after) {
          after = paging.next.after;
        } else {
          hasMore = false;
        }

        // Optional: Add small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`🎉 Successfully fetched all ${allDeals.length} deals from HubSpot!`);
      return allDeals;

    } catch (error) {
      console.error('❌ Error fetching deals:', error);
      throw error;
    }
  }

  // Fetch deals with specific filters
  async getDealsWithFilters(filters: FilterOption[] = []): Promise<HubSpotDeal[]> {
    try {
      console.log('🔍 Fetching deals with filters...');

      const searchPayload: SearchPayload = {
        filterGroups: [{ filters }],
        properties: this.defaultProperties,
        limit: 100
      };

      const response = await this.makeRequest<HubSpotDealsResponse>(
        'POST',
        `${this.baseURL}/search`,
        searchPayload
      );

      console.log(`✅ Found ${response.results.length} deals matching filters`);
      return response.results;

    } catch (error) {
      console.error('❌ Error fetching filtered deals:', error);
      throw error;
    }
  }

  // Get deals by specific stage
  async getDealsByStage(stageName: string): Promise<HubSpotDeal[]> {
    const filters: FilterOption[] = [{
      propertyName: 'dealstage',
      operator: 'EQ',
      value: stageName
    }];

    return await this.getDealsWithFilters(filters);
  }

  // Get recent deals (created in last N days)
  async getRecentDeals(days: number = 30): Promise<HubSpotDeal[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const filters: FilterOption[] = [{
      propertyName: 'createdate',
      operator: 'GT',
      value: cutoffDate.getTime()
    }];

    return await this.getDealsWithFilters(filters);
  }

  // Get deals by amount range
  async getDealsByAmountRange(minAmount: number, maxAmount?: number): Promise<HubSpotDeal[]> {
    const filters: FilterOption[] = [
      {
        propertyName: 'amount',
        operator: 'GT',
        value: minAmount
      }
    ];

    if (maxAmount) {
      filters.push({
        propertyName: 'amount',
        operator: 'LT',
        value: maxAmount
      });
    }

    return await this.getDealsWithFilters(filters);
  }

  // Get deals by owner
  async getDealsByOwner(ownerId: string): Promise<HubSpotDeal[]> {
    const filters: FilterOption[] = [{
      propertyName: 'hubspot_owner_id',
      operator: 'EQ',
      value: ownerId
    }];

    return await this.getDealsWithFilters(filters);
  }

  // Get associated contacts for a deal
  async getDealContacts(dealId: string): Promise<HubSpotAssociation[]> {
    try {
      const response = await this.makeRequest<HubSpotAssociationsResponse>(
        'GET',
        `${this.baseURL}/${dealId}/associations/contacts`
      );
      return response.results;
    } catch (error) {
      console.error('Error fetching deal contacts:', error);
      return [];
    }
  }

  // Get associated company for a deal
  async getDealCompany(dealId: string): Promise<HubSpotAssociation | null> {
    try {
      const response = await this.makeRequest<HubSpotAssociationsResponse>(
        'GET',
        `${this.baseURL}/${dealId}/associations/companies`
      );
      return response.results[0] || null;
    } catch (error) {
      console.error('Error fetching deal company:', error);
      return null;
    }
  }

  // Format deals for easier consumption
  formatDeals(deals: HubSpotDeal[]): FormattedDeal[] {
    return deals.map(deal => ({
      id: deal.id,
      name: deal.properties.dealname || 'Unnamed Deal',
      amount: parseFloat(deal.properties.amount || '0') || 0,
      currency: deal.properties.deal_currency_code || 'USD',
      stage: deal.properties.dealstage || 'Unknown',
      pipeline: deal.properties.pipeline || 'Default',
      closeDate: deal.properties.closedate ? new Date(deal.properties.closedate) : null,
      createDate: new Date(deal.properties.createdate),
      lastModified: new Date(deal.properties.hs_lastmodifieddate),
      ownerId: deal.properties.hubspot_owner_id || null,
      rawProperties: deal.properties
    }));
  }

  // Get deal statistics
  getDealsStats(deals: FormattedDeal[]): DealsStats {
    const totalDeals = deals.length;
    const totalValue = deals.reduce((sum, deal) => sum + deal.amount, 0);
    
    // Group by stage
    const stageBreakdown: Record<string, number> = {};
    deals.forEach(deal => {
      stageBreakdown[deal.stage] = (stageBreakdown[deal.stage] || 0) + 1;
    });

    return {
      totalDeals,
      totalValue,
      stageBreakdown,
      averageDealValue: totalDeals > 0 ? totalValue / totalDeals : 0
    };
  }

  // Search deals with advanced options
  async searchDeals(searchOptions: {
    filters?: FilterOption[];
    sorts?: Array<{ propertyName: string; direction: 'ASCENDING' | 'DESCENDING' }>;
    properties?: string[];
    limit?: number;
  }): Promise<HubSpotDeal[]> {
    const {
      filters = [],
      sorts = [],
      properties = this.defaultProperties,
      limit = 100
    } = searchOptions;

    const searchPayload: SearchPayload = {
      properties,
      limit
    };

    if (filters.length > 0) {
      searchPayload.filterGroups = [{ filters }];
    }

    if (sorts.length > 0) {
      searchPayload.sorts = sorts;
    }

    try {
      const response = await this.makeRequest<HubSpotDealsResponse>(
        'POST',
        `${this.baseURL}/search`,
        searchPayload
      );

      return response.results;
    } catch (error) {
      console.error('❌ Error searching deals:', error);
      throw error;
    }
  }
}

// Simple function to fetch all deals (if you prefer a single function)
async function fetchAllHubSpotDeals(
  accessToken: string, 
  options: GetAllDealsOptions = {}
): Promise<any> {
  const hubspotAPI = new HubSpotDealsAPI(accessToken);
  
  try {
    const deals = await hubspotAPI.getAllDeals(options);
    const formattedDeals = hubspotAPI.formatDeals(deals);
    const stats = hubspotAPI.getDealsStats(formattedDeals);
    
    console.log('\n📊 DEAL SUMMARY:');
    console.log(`Total Deals: ${stats.totalDeals}`);
    console.log(`Total Value: $${stats.totalValue.toLocaleString()}`);
    console.log(`Average Deal Value: $${stats.averageDealValue.toLocaleString()}`);
    
    if (formattedDeals.length > 0) {
      console.log('\n📈 Deals by Stage:');
      Object.entries(stats.stageBreakdown).forEach(([stage, count]) => {
        console.log(`  ${stage}: ${count} deals`);
      });
    }
    
    return formattedDeals;
    
  } catch (error: any) {
    console.error('Failed to fetch deals:', error.message);
    return [];
  }
}

// Usage Examples with proper typing:

// Example 1: Simple usage with environment variable
async function example1(): Promise<FormattedDeal[]> {
  const accessToken = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error('HUBSPOT_ACCESS_TOKEN environment variable is required');
  }
  
  const deals = await fetchAllHubSpotDeals(accessToken);
  console.log(`Fetched ${deals.length} deals`);
  return deals;
}

// Example 2: Using the class with custom options
async function example2(): Promise<{
  all: FormattedDeal[];
  closedWon: FormattedDeal[];
  recent: FormattedDeal[];
  highValue: FormattedDeal[];
}> {
  const accessToken = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error('HUBSPOT_ACCESS_TOKEN environment variable is required');
  }
  
  const hubspot = new HubSpotDealsAPI(accessToken);
  
  // Get all deals with associations
  const allDeals = await hubspot.getAllDeals({ 
    includeAssociations: true,
    limit: 50 
  });
  
  // Get deals from specific stage
  const closedWonDeals = await hubspot.getDealsByStage('closedwon');
  
  // Get recent deals (last 7 days)
  const recentDeals = await hubspot.getRecentDeals(7);
  
  // Get high-value deals (over $10,000)
  const highValueDeals = await hubspot.getDealsByAmountRange(10000);
  
  console.log('All deals:', allDeals.length);
  console.log('Closed won deals:', closedWonDeals.length);
  console.log('Recent deals:', recentDeals.length);
  console.log('High value deals:', highValueDeals.length);
  
  return {
    all: hubspot.formatDeals(allDeals),
    closedWon: hubspot.formatDeals(closedWonDeals),
    recent: hubspot.formatDeals(recentDeals),
    highValue: hubspot.formatDeals(highValueDeals)
  };
}

// Export for use in other files
export {
  HubSpotDealsAPI,
  fetchAllHubSpotDeals,
  HubSpotDeal,
  FormattedDeal,
  FilterOption,
  GetAllDealsOptions,
  DealsStats
};

// If running this file directly, execute example
if (require.main === module) {
  example1().catch(console.error);
}