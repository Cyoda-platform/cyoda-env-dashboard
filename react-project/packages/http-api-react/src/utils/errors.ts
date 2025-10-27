import { AxiosError } from 'axios';
import { message } from 'antd';

/**
 * Error handler utility
 * Migrated from @cyoda/ui-lib/src/helpers/HelperErrors
 */
export class HelperErrors {
  /**
   * Handle axios errors
   */
  static handler(error: AxiosError | Error): void {
    if (this.isAxiosError(error)) {
      this.handleAxiosError(error);
    } else {
      this.handleGenericError(error);
    }
  }

  /**
   * Check if error is an Axios error
   */
  private static isAxiosError(error: any): error is AxiosError {
    return error.isAxiosError === true;
  }

  /**
   * Handle Axios-specific errors
   */
  private static handleAxiosError(error: AxiosError): void {
    const status = error.response?.status;
    const data = error.response?.data as any;

    // Don't show error for 401 (handled by interceptor) or 404 (too noisy)
    if (status === 401 || status === 404) {
      // Log to console in development only
      if (import.meta.env.DEV) {
        console.warn(`API ${status}:`, error.config?.url);
      }
      return;
    }

    // Extract error message
    let errorMessage = 'An error occurred';

    if (data) {
      if (typeof data === 'string') {
        errorMessage = data;
      } else if (data.message) {
        errorMessage = data.message;
      } else if (data.error) {
        errorMessage = data.error;
      } else if (data.errors && Array.isArray(data.errors)) {
        errorMessage = data.errors.join(', ');
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Show error message based on status
    switch (status) {
      case 400:
        message.error(`Bad Request: ${errorMessage}`);
        break;
      case 403:
        message.error(`Forbidden: ${errorMessage}`);
        break;
      case 500:
        message.error(`Server Error: ${errorMessage}`);
        break;
      case 503:
        message.error(`Service Unavailable: ${errorMessage}`);
        break;
      default:
        if (status && status >= 400) {
          message.error(`Error ${status}: ${errorMessage}`);
        } else {
          message.error(errorMessage);
        }
    }

    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('API Error:', error);
    }
  }

  /**
   * Handle generic errors
   */
  private static handleGenericError(error: Error): void {
    message.error(error.message || 'An unexpected error occurred');

    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('Error:', error);
    }
  }

  /**
   * Show success message
   */
  static success(msg: string): void {
    message.success(msg);
  }

  /**
   * Show warning message
   */
  static warning(msg: string): void {
    message.warning(msg);
  }

  /**
   * Show info message
   */
  static info(msg: string): void {
    message.info(msg);
  }

  /**
   * Show error message
   */
  static error(msg: string): void {
    message.error(msg);
  }
}

export default HelperErrors;

