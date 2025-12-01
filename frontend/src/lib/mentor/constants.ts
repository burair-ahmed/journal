export const AVAILABLE_TABS = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    description: 'Overview, analytics, and widgets',
    icon: 'LayoutDashboard'
  },
  { 
    id: 'trades', 
    label: 'Trades', 
    description: 'Trade history and details',
    icon: 'TrendingUp'
  },
  { 
    id: 'notebook', 
    label: 'Notebook', 
    description: 'Trading notes, goals, and journal',
    icon: 'BookOpen'
  },
  { 
    id: 'reports', 
    label: 'Reports', 
    description: 'Performance reports and analytics',
    icon: 'FileText'
  },
  { 
    id: 'profile', 
    label: 'Profile', 
    description: 'Account profile and settings',
    icon: 'User'
  },
  { 
    id: 'addAccount', 
    label: 'Manage Accounts', 
    description: 'View and manage trading accounts',
    icon: 'Settings'
  },
] as const;

export type TabId = typeof AVAILABLE_TABS[number]['id'];
