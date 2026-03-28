import { toast as sonnerToast } from 'sonner';

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
}

export function useToast() {
  const toast = (options: ToastOptions) => {
    const { title, description, variant = 'default', duration } = options;
    
    const message = title || description || '';
    const descriptionText = title && description ? description : undefined;
    
    switch (variant) {
      case 'destructive':
        return sonnerToast.error(message, {
          description: descriptionText,
          duration: duration || 4000,
        });
      case 'success':
        return sonnerToast.success(message, {
          description: descriptionText,
          duration: duration || 4000,
        });
      default:
        return sonnerToast(message, {
          description: descriptionText,
          duration: duration || 4000,
        });
    }
  };

  toast.loading = (message: string) => sonnerToast.loading(message);
  toast.success = (message: string, options?: { id?: string }) => {
    if (options?.id) {
      sonnerToast.success(message, { id: options.id });
      return options.id;
    }
    return sonnerToast.success(message);
  };
  toast.error = (message: string, options?: { id?: string }) => {
    if (options?.id) {
      sonnerToast.error(message, { id: options.id });
      return options.id;
    }
    return sonnerToast.error(message);
  };
  toast.dismiss = (id?: string) => {
    if (id) {
      sonnerToast.dismiss(id);
    } else {
      sonnerToast.dismiss();
    }
  };

  return { toast };
}

// Export toast directamente para uso sin hook
export { sonnerToast as toast };
