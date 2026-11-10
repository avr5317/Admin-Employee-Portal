// Role-aware navigation shared by the Navbar and Footer.
// Paths match the existing routes in App.jsx.
export const isAdmin = (user) => user?.type === 'admin';

export const getRoleLabel = (user) => (isAdmin(user) ? 'Admin' : 'Employee');

export const getHomePath = (user) => {
  if (!user) return '/login';
  return isAdmin(user) ? '/admin/employees' : '/';
};

export const getJobsPath = (user) => (isAdmin(user) ? '/admin/jobs' : '/jobs');
export const getCompaniesPath = (user) => (isAdmin(user) ? '/admin/companies' : '/companies');
export const getAboutPath = (user) => (isAdmin(user) ? '/admin/about' : '/about');
export const getContactPath = (user) => (isAdmin(user) ? '/admin/contact' : '/contact');

export function getNavLinks(user) {
  if (!user) return [];
  if (isAdmin(user)) {
    return [
      { label: 'Employees', to: '/admin/employees' },
      { label: 'Add job', to: '/add-job' },
      { label: 'Jobs', to: '/admin/jobs' },
      { label: 'Companies', to: '/admin/companies' },
      { label: 'About', to: '/admin/about' },
      { label: 'Contact', to: '/admin/contact' },
    ];
  }
  return [
    { label: 'Home', to: '/' },
    { label: 'Jobs', to: '/jobs' },
    { label: 'Companies', to: '/companies' },
    { label: 'About', to: '/about' },
    { label: 'Contact', to: '/contact' },
  ];
}
