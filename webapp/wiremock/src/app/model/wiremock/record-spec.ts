export class RecordSpec {
  targetBaseUrl!: string;

  filters: any;

  captureHeaders: any;

  requestBodyPattern: any;

  extractBodyCriteria: any;

  outputFormat: any;

  persist: any;

  repeatsAsScenarios: any;

  transformers: any;

  transformerParameters: any;

  deserialize(_unchecked: RecordSpec) {
    return this;
  }
}
