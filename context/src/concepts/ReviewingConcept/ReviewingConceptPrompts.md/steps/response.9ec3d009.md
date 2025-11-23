---
timestamp: 'Sun Nov 23 2025 15:13:59 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251123_151359.81fcc629.md]]'
content_id: 9ec3d0095e5f1bdb197d36d1853a8e630a1d44fc3c874e7b3f3ac2e34491ea9e
---

# response:

Here are 5 unit tests for the `ReviewingConcept.ts` file, written using the exact structure and style of `WishlistConcept.test.ts`. These tests cover the primary actions and edge cases of the concept.

@[ReviewingConcept.test.ts](/src/concepts/ReviewingConcept/ReviewingConcept.test.ts)

```typescript
import { ReviewingConcept } from './ReviewingConcept';
import { LanguageOption } from '../../options/LanguageOption';

describe('ReviewingConcept', () => {
  let reviewingConcept: ReviewingConcept;
  let languageOption: LanguageOption;

  beforeEach(() => {
    // This setup will be re-run before each test, ensuring a clean state.
    languageOption = new LanguageOption();
  });

  /**
   * Test Case 1
   * Demonstrates the primary success case for generating a system message
   * with a supported language (TypeScript).
   */
  it('should generate a system message tailored for TypeScript', () => {
    languageOption.value = 'TypeScript';
    reviewingConcept = new ReviewingConcept({ language: languageOption });

    const systemMessage = reviewingConcept.getSystemMessage();

    expect(systemMessage).toContain('You are an expert code reviewer for TypeScript.');
    expect(systemMessage).toContain('Focus on correctness, best practices, and readability.');
  });

  /**
   * Test Case 2
   * Demonstrates the primary success case for generating a system message
   * with another supported language (Python) to ensure logic is not hardcoded.
   */
  it('should generate a system message tailored for Python', () => {
    languageOption.value = 'Python';
    reviewingConcept = new ReviewingConcept({ language: languageOption });

    const systemMessage = reviewingConcept.getSystemMessage();

    expect(systemMessage).toContain('You are an expert code reviewer for Python.');
    expect(systemMessage).toContain('Pay close attention to PEP 8 guidelines, idiomatic Python, and performance.');
  });

  /**
   * Test Case 3
   * Demonstrates the edge case where an unsupported language is provided,
   * expecting a generic fallback message.
   */
  it('should generate a generic system message for an unsupported language', () => {
    // Use 'as any' to bypass type safety for testing this edge case
    languageOption.value = 'Rust' as any;
    reviewingConcept = new ReviewingConcept({ language: languageOption });

    const systemMessage = reviewingConcept.getSystemMessage();

    expect(systemMessage).toContain('You are an expert code reviewer.');
    expect(systemMessage).not.toContain('for Rust'); // Ensure it doesn't just parrot the unsupported language
  });

  /**
   * Test Case 4
   * Demonstrates the primary success case for the user prompt action, ensuring
   * the code is correctly formatted within a language-specific markdown block.
   */
  it('should generate a user prompt with the provided code and language identifier', () => {
    languageOption.value = 'TypeScript';
    reviewingConcept = new ReviewingConcept({ language: languageOption });
    const codeToReview = `const add = (a: number, b: number): number => a + b;`;

    const prompt = reviewingConcept.userPrompt(codeToReview);
    const expectedPrompt = `Please review the following code snippet:
\`\`\`typescript
${codeToReview}
\`\`\``;

    expect(prompt).toBe(expectedPrompt);
  });

  /**
   * Test Case 5
   * Demonstrates the edge case for the user prompt where the input code
   * snippet is an empty string.
   */
  it('should correctly format the user prompt when the code snippet is empty', () => {
    languageOption.value = 'JavaScript';
    reviewingConcept = new ReviewingConcept({ language: languageOption });
    const codeToReview = '';

    const prompt = reviewingConcept.userPrompt(codeToReview);
    const expectedPrompt = `Please review the following code snippet:
\`\`\`javascript

\`\`\``;

    expect(prompt).toBe(expectedPrompt);
  });
});
```
