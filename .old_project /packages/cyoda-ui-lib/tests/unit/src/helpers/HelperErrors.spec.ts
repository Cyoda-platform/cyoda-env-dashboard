import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ElMessageBox, ElNotification } from 'element-plus';
import HelperErrors from '../../../../src/helpers/HelperErrors';
import ERROR_MESSAGES from '../../../../src/disctionaries/errorMessages.json';

vi.mock('element-plus', () => ({
  ElMessageBox: {
    alert: vi.fn(),
  },
  ElNotification: vi.fn(),
}));

describe('HelperErrors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handler', () => {
    it('should handle network error', () => {
      const error = { message: 'Network Error' };
      HelperErrors.handler(error);
      expect(ElMessageBox.alert).toHaveBeenCalledWith(
        'Please check your network configurations',
        'Network Error',
        expect.objectContaining({
          dangerouslyUseHTMLString: true,
          customClass: 'helper-errors',
        })
      );
    });

    it('should handle server response with no message', () => {
      const error = {
        response: {
          status: 500,
          data: {},
        },
      };
      HelperErrors.handler(error);
      expect(ElMessageBox.alert).toHaveBeenCalledWith(
        'Server response status 500',
        'Server error',
        expect.objectContaining({
          dangerouslyUseHTMLString: true,
          customClass: 'helper-errors',
        })
      );
    });

    it('should ignore errors with a cancel message', () => {
      const error = { message: 'canceled' };
      HelperErrors.handler(error);
      expect(ElMessageBox.alert).not.toHaveBeenCalled();
    });

    it('should handle errors from the dictionary', () => {
      const error = { errors: { key1: 'error_key_1', key2: 'error_key_2' } };
      ERROR_MESSAGES['error_key_1'] = 'Error Message 1';
      ERROR_MESSAGES['error_key_2'] = 'Error Message 2';
      HelperErrors.handler(error);
      expect(ElNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error',
          message: 'Error Message 1',
          type: 'error',
        })
      );
      expect(ElNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error',
          message: 'Error Message 2',
          type: 'error',
        })
      );
    });

    it('should handle errors with message', () => {
      const error = { message: 'Some error occurred' };
      HelperErrors.handler(error);
      expect(ElMessageBox.alert).toHaveBeenCalledWith(
        'Some error occurred',
        'Error!',
        expect.objectContaining({
          dangerouslyUseHTMLString: true,
          customClass: 'helper-errors',
        })
      );
    });

    it('should skip showing errors if warning element is present', () => {
      document.body.innerHTML = '<div class="helper-errors"></div>';
      const error = { message: 'Some error' };
      HelperErrors.handler(error);
      expect(ElMessageBox.alert).not.toHaveBeenCalled();
    });
  });

  describe('isErrorExistInDictionary', () => {
    it('should return true if any error exists in the dictionary', () => {
      ERROR_MESSAGES['error_key'] = 'Error Message';
      const errors = { key1: 'error_key' };
      expect(HelperErrors.isErrorExistInDictionary(errors)).toBe(true);
    });

    it('should return false if no errors exist in the dictionary', () => {
      const errors = { key1: 'unknown_key' };
      expect(HelperErrors.isErrorExistInDictionary(errors)).toBe(false);
    });
  });

  describe('getAllErrorMessagesFromDictionaries', () => {
    it('should return error messages from the dictionary', () => {
      ERROR_MESSAGES['error_key'] = 'Error Message';
      const errors = { key1: 'error_key' };
      expect(HelperErrors.getAllErrorMessagesFromDictionaries(errors)).toEqual(['Error Message']);
    });

    it('should return original errors if not in the dictionary', () => {
      const errors = { key1: 'unknown_key' };
      expect(HelperErrors.getAllErrorMessagesFromDictionaries(errors)).toEqual(['unknown_key']);
    });
  });
});
