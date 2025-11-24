---
timestamp: 'Fri Nov 21 2025 16:48:29 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251121_164829.880843c0.md]]'
content_id: ad5cd72ef0b0f825e8c41a2d75bf31b4252579df15efdc0c767603f4a4c63d70
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
    // Tests that need a specific language will re-initialize the concept.
    languageOption = new LanguageOption();
  });

  it('should generate a system message tailored for TypeScript', () => {
    languageOption.value = 'TypeScript';
    reviewingConcept = new ReviewingConcept({ language: languageOption });

    const systemMessage = reviewingConcept.getSystemMessage();

    expect(systemMessage).toContain('You are an expert code reviewer for TypeScript.');
    expect(systemMessage).toContain('Focus on correctness, best practices, and readability.');
  });

  it('should generate a system message tailored for Python', () => {
    languageOption.value = 'Python';
    reviewingConcept = new ReviewingConcept({ language: languageOption });

    const systemMessage = reviewingConcept.getSystemMessage();

    expect(systemMessage).toContain('You are an expert code reviewer for Python.');
    expect(systemMessage).toContain('Pay close attention to PEP 8 guidelines, idiomatic Python, and performance.');
  });

  it('should generate a generic system message for an unsupported language', () => {
    // Use 'as any' to bypass type safety for testing this edge case
    languageOption.value = 'Rust' as any;
    reviewingConcept = new ReviewingConcept({ language: languageOption });

    const systemMessage = reviewingConcept.getSystemMessage();

    expect(systemMessage).toContain('You are an expert code reviewer.');
    expect(systemMessage).not.toContain('for Rust'); // Ensure it doesn't just parrot the unsupported language
  });

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
