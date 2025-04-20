// composables/useTextUtils.ts
export function useTextUtils() {
  const truncate = (text: string, maxLength: number = 30) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return {
    truncate
  };
}
