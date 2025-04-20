export function useSuccessToast(message: string) {
  const toast = useToast();
  toast.add({
    title: 'Success',
    description: message,
    timeout: 5000,
    icon:"i-heroicons-check-circle",
    color:"green"
  });
}

export function useErrorToast(message: string) {
  const toast = useToast();
  toast.add({
    title: 'Error',
    description: message,          
    timeout: 5000,
    icon:"i-heroicons-exclamation-circle",
    color:"red"
  });
}

export function useDeleteToast(message: string) {
  const toast = useToast();
  toast.add({    
    description: message,          
    title: 'Delete',                   
    timeout: 5000,
    icon:"i-heroicons-trash",
    color:"gray"
  });
}