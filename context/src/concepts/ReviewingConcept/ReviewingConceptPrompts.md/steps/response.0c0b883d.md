---
timestamp: 'Sun Nov 23 2025 15:11:52 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251123_151152.409ac060.md]]'
content_id: 0c0b883d25806bac1ff6184aa5f0c8cc005e1df72e112a88bd94668246bea063
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

@[WishlistConcept.test.ts](/../61040-away-backend/src/concepts/Wishlist/WishlistConcept.test.ts)

@[ReviewingConcept.ts](/src/concepts/ReviewingConcept/RevieiwngConcept.ts)

\#prompt Using the exact structure of the tests in WishlistConcept.test.ts, write 5 separate tests for the reviewing concept found at ReviewingConcept.ts that test all actions/queries and edge cases.
