// Utilitaires pour la gestion de la devise XOF (Franc CFA)

export const formatCurrency = (amount: number, currency: string = 'XOF'): string => {
  if (currency === 'XOF') {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
  
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
};

export const formatNumber = (amount: number): string => {
  return new Intl.NumberFormat('fr-SN').format(amount);
};

// Conversion EUR vers XOF (taux approximatif: 1 EUR = 655.957 XOF)
export const convertEurToXof = (amountInEur: number): number => {
  return Math.round(amountInEur * 655.957);
};

// Conversion XOF vers EUR
export const convertXofToEur = (amountInXof: number): number => {
  return amountInXof / 655.957;
};

export const getCurrencySymbol = (currency: string = 'XOF'): string => {
  switch (currency) {
    case 'XOF':
      return 'F CFA';
    case 'EUR':
      return '€';
    case 'USD':
      return '$';
    default:
      return currency;
  }
};