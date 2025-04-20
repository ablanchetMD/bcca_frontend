import type { FormCategory } from '~~/types/FormCategory';
export const protocolLabsCategories: FormCategory[] = [
    { label: 'Baseline', value: 'baseline', icon: '' },
    { label: 'Follow-Up', value: 'followup', icon: '' },
    { label: 'Unknown', value: 'unknown', icon: '' },
  ]

export const protocolLabsUrgencies: FormCategory[] = [
    { label: 'Urgent', value: 'urgent', icon: '' },
    { label: 'Non-Urgent', value: 'non_urgent', icon: '' },
    { label: 'If Necessary', value: 'if_necessary', icon: '' },
    { label: 'Unknown', value: 'unknown', icon: '' },
  ]