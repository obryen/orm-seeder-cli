export class ClassificationService {
  private rules = {
    // Additional rules can be added here
  };

  getRules(): Record<string, any> {
    return this.rules;
  }
}