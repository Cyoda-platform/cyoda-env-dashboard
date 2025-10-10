import HelperCyodaChart from "../../../src/helpers/HelperCyodaChart";

describe('HelperCyodaChart', () => {
  describe('getType', () => {
    it('should return "list-ol" for number types', () => {
      const result = HelperCyodaChart.getType('number');
      expect(result).toBe('list-ol');
    });

    it('should return "calendar-alt" for date types', () => {
      const result = HelperCyodaChart.getType('Date');
      expect(result).toBe('calendar-alt');
    });

    it('should return "heading" for other types', () => {
      const result = HelperCyodaChart.getType('string');
      expect(result).toBe('heading');
    });
  });

  describe('checkTrendline', () => {
    it('should return true for number types', () => {
      const result = HelperCyodaChart.checkTrendline('number');
      expect(result).toBe(true);
    });

    it('should return true for date types', () => {
      const result = HelperCyodaChart.checkTrendline('Date');
      expect(result).toBe(true);
    });

    it('should return false for other types', () => {
      const result = HelperCyodaChart.checkTrendline('string');
      expect(result).toBe(false);
    });
  });
});
