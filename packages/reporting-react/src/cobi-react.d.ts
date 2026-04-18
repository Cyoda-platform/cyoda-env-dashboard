// Ambient stub for the deprecated @cyoda/cobi-react package.
// reporting-react still imports FilterBuilderGroup and FilterBuilderCondition
// from there at runtime; this stub lets tsc succeed without type-checking
// cobi-react's broken source tree (cobi-react is marked deprecated and is
// excluded from CI workflows — see feedback_deprecated_modules memory).
declare module '@cyoda/cobi-react' {
  export const FilterBuilderGroup: any
  export const FilterBuilderCondition: any
}
