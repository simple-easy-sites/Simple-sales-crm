
import React from 'react';
import Header from '../components/Header';
import { Button } from '../components/ui/Button';
import { Icons } from '../components/ui/Icons';
import { Badge } from '../components/ui/Badge';

// Sample data for demonstration
const deals = [
  { id: 1, merchant: 'Main Street Coffee', status: 'New Lead', funded: 0, contact: 'Alice' },
  { id: 2, merchant: 'Downtown Auto Repair', status: 'Funded', funded: 50000, contact: 'Bob' },
  { id: 3, merchant: 'The Corner Bakery', status: 'Declined', funded: 0, contact: 'Charlie' },
  { id: 4, merchant: 'Global Tech Inc.', status: 'Funded', funded: 150000, contact: 'Diana' },
  { id: 5, merchant: 'Local Hardware', status: 'New Lead', funded: 0, contact: 'Eve' },
];

const DashboardPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-dark-bg">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold tracking-tight text-light-text dark:text-dark-text">
              Deals Pipeline
            </h2>
            <Button>
              <Icons.Plus className="mr-2 h-4 w-4" />
              New Deal
            </Button>
          </div>

          <div className="bg-white dark:bg-slate-900/50 shadow-sm rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Merchant</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Funded Amount</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {deals.map((deal) => (
                    <tr key={deal.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-light-text dark:text-dark-text">{deal.merchant}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Badge variant={
                          deal.status === 'Funded' ? 'success' :
                          deal.status === 'Declined' ? 'danger' : 'info'
                        }>
                          {deal.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(deal.funded)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{deal.contact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
