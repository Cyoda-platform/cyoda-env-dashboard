import { AxiosError } from 'axios';
import { message, Modal, notification } from 'antd';
import ERROR_MESSAGES from '../dictionaries/errorMessages.json';

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

    // Check if error message is 'canceled' (request was cancelled)
    if (error.message === 'canceled') {
      return;
    }

    // Check for errors from dictionary (like in Vue project)
    if (data && data.errors && this.isErrorExistInDictionary(data.errors)) {
      const messages = this.getAllErrorMessagesFromDictionaries(data.errors);
      messages.forEach((msg) => {
        notification.error({
          message: 'Error',
          description: msg,
        });
      });
      return;
    }

    // Extract error message
    let errorMessage = 'An error occurred';
    let errorDetail = '';

    if (data) {
      if (typeof data === 'string') {
        errorMessage = data;
      } else if (data.detail) {
        // Cyoda backend returns detailed error messages in 'detail' field
        errorMessage = data.detail;
        // Extract error code if present
        if (data.properties && data.properties.errorCode) {
          errorDetail = `If assistance is needed, you may check available support options and provide the unique error code ${data.properties.errorCode} if contacting support.`;
        }
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

    // For server errors (500), show detailed modal like in Vue project
    if (status === 500) {
      const fullMessage = errorDetail
        ? `The Cyoda server encountered an unexpected error: ${errorMessage}\n\n${errorDetail}`
        : `The Cyoda server encountered an unexpected error: ${errorMessage}`;

      Modal.error({
        title: 'Error!',
        content: fullMessage,
        width: 600,
      });
    } else {
      // For other errors, show simple message
      switch (status) {
        case 400:
          message.error(`Bad Request: ${errorMessage}`);
          break;
        case 403:
          message.error(`Forbidden: ${errorMessage}`);
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

  /**
   * Check if error exists in dictionary
   * Migrated from Vue project
   */
  private static isErrorExistInDictionary(errors: any): boolean {
    if (typeof errors !== 'object') return false;
    return Object.values(errors).some((error) => {
      return ERROR_MESSAGES[error as keyof typeof ERROR_MESSAGES];
    });
  }

  /**
   * Get all error messages from dictionaries
   * Migrated from Vue project
   */
  private static getAllErrorMessagesFromDictionaries(errors: any): string[] {
    return Object.values(errors).map((error) => {
      return ERROR_MESSAGES[error as keyof typeof ERROR_MESSAGES] || (error as string);
    });
  }
}

export default HelperErrors;

