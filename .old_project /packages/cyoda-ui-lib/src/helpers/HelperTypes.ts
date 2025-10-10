export default class HelperTypes {
  public static numbersTypes = ['Long', 'Double', 'Integer', 'Float'];

  public static numbersTypesAsString = ['BigDecimal', 'BigInteger'];

  public static datesTypes = ['Date', 'LocalDate', 'LocalDateTime'];

  public static allTypes = [
    'String',
    ...HelperTypes.datesTypes,
    ...HelperTypes.numbersTypes,
    ...HelperTypes.numbersTypesAsString,
    'UUID',
  ];

  public static datesNumbers = [
    ...HelperTypes.datesTypes,
    ...HelperTypes.numbersTypes,
    ...HelperTypes.numbersTypesAsString,
  ];
}
