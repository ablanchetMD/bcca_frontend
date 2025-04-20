import type { FormCategory } from '~~/types/FormCategory';

export function useFindFormID(list: FormCategory[], id: string | any, value: any) {
  if (typeof id !== 'string') return value; // Return default if id is not a string
  return list.find(item => item.value.toLowerCase() === id.toLowerCase()) ?? value;
}

