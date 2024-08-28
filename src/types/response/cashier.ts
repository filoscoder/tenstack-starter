export type ComissionResponse = {
  // subagent panel_id
  [key: string]: {
    agent: {
      id: number;
      username: string;
      balance_currency: string;
      role: string;
    };
    payments_percentage: number;
    unpaid_bets: string; // float
    bets: string; // float
    wins: string; // float
    profit: number;
    commission: string; // float
    agents_commission: string; // float
    total_commission: string; // float
    children: any[];
  };
};

export type GeneralReport = {
  total: BetReport;
  providers: GameProvider[];
};

export type GameProvider = BetReport & {
  producer: string;
};

export type BetReport = {
  bets_count: number;
  total_bets: string;
  total_wins: string;
  total_profit: string;
};
