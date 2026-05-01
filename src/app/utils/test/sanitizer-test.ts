import SQLInjectionPrevention from "../sanitizer";

// Test cases with potentially malicious inputs
const testCases = [
  {
    email: "hacker@example.com'; DROP TABLE users; --",
    password: "pass' OR '1'='1"
  },
  {
    email: "robert'); UNION SELECT username, password FROM users; --",
    password: "' OR 1=1--"
  },
  {
    email: "admin@localhost EXEC xp_cmdshell('netstat -an')--",
    password: "' UNION SELECT NULL, NULL, CONCAT(username, ':', password) FROM users--"
  },
  {
    email: "test@example.com\\ OR 1=1",
    password: "password\\ OR 1=1"
  },
  {
    email: "'; DELETE FROM users; --",
    password: "' OR ''='"
  }
];

// Function to test sanitization
export function testSanitization() {
  testCases.forEach((testCase, index) => {
    console.log(`\nTest Case ${index + 1}:`);
    console.log('Original Email:', testCase.email);
    console.log('Original Password:', testCase.password);

    // Sanitize and validate email
    const emailValidation = SQLInjectionPrevention.sanitizeAndValidate(testCase.email);
    console.log('Sanitized Email:', emailValidation.sanitizedInput);
    console.log('Email is Valid:', emailValidation.isValid);

    // Sanitize and validate password
    const passwordValidation = SQLInjectionPrevention.sanitizeAndValidate(testCase.password);
    console.log('Sanitized Password:', passwordValidation.sanitizedInput);
    console.log('Password is Valid:', passwordValidation.isValid);
  });
}
