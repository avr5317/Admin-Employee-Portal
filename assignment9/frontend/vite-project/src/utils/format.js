const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export const formatSalary = (value) => currency.format(Number(value) || 0);

export const initialsOf = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

// Dark enough that white text passes WCAG AA (4.5:1) on every one of these.
const AVATAR_COLORS = [
  '#3846A8', '#00695C', '#AD1457', '#6A1B9A', '#BF360C',
  '#1565C0', '#4E342E', '#2E7D32', '#455A64',
];

// Same name always gets the same color
export const avatarColor = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};
