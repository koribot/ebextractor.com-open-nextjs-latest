import validator from "validator";
class SQLInjectionPrevention {
  // Basic SQL injection prevention
  static preventSQLInjection(input: string): string {
    // Convert RegExp to a string of characters to blacklist
    const blacklistChars = "[;'\"\\\\]";

    // Use the string version of blacklist characters
    return validator.blacklist(input, blacklistChars);
  }

  // More comprehensive SQL injection prevention
  static sanitizeInput(input: string): string {
    // Trim whitespace
    let sanitized = validator.trim(input);

    // Remove potential SQL injection characters
    sanitized = sanitized.replace(/[;'"\\]/g, "");

    // Optional: limit length to prevent buffer overflow attacks
    sanitized = sanitized.slice(0, 255);

    return sanitized;
  }

  // Advanced validation with regex
  static isValidInput(input: string): boolean {
    // Reject inputs with known SQL injection patterns
    const sqlInjectionPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b)/i,
      /(\-\-|\#|\/\*|\*\/)/,
      /(\b(AND|OR)\b\s*1\s*=\s*1)/i,
    ];

    return !sqlInjectionPatterns.some((pattern) => pattern.test(input));
  }

  // Additional method for more robust input validation
  static sanitizeAndValidate(input: string): {
    isValid: boolean;
    sanitizedInput: string;
  } {
    const sanitizedInput = this.sanitizeInput(input);
    const isValid = this.isValidInput(sanitizedInput);

    return {
      isValid,
      sanitizedInput,
    };
  }
}

export default SQLInjectionPrevention;
