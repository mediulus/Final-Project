---
timestamp: 'Fri Nov 21 2025 16:45:14 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251121_164514.3aeb9444.md]]'
content_id: 7b298a63e208f577691c01e7640efd7fca7fad8b4686418f77d981e755d97368
---

# response:

Here are 5 unit tests for the `ReviewingConcept.ts` file, written using a Jest-like testing framework. These tests cover the primary actions and notable edge cases.

@[ReviewingConcept.test.ts](/src/concepts/ReviewingConcept/ReviewingConcept.test.ts)

```typescript
import { ReviewingConcept } from './ReviewingConcept';
import { LanguageOption } from '../../options/LanguageOption';

describe('ReviewingConcept', () => {
  let languageOption: LanguageOption;

  beforeEach(() => {
    // Initialize a fresh LanguageOption for each test
    languageOption = new LanguageOption();
  });

  // Test 1: Primary success case for the system message
  it('should generate the correct system message for TypeScript', () => {
    languageOption.value = 'TypeScript';
    const concept = new ReviewingConcept({ language: languageOption });

    const systemMessage = concept.getSystemMessage();
    expect(systemMessage).toContain('You are an expert code reviewer for TypeScript.');
    expect(systemMessage).toContain('Focus on correctness, best practices, and readability.');
  });

  // Test 2: Test another supported language to ensure the logic is not hardcoded
  it('should generate the correct system message for Python', () => {
    languageOption.value = 'Python';
    const concept = new ReviewingConcept({ language: languageOption });

    const systemMessage = concept.getSystemMessage();
    expect(systemMessage).toContain('You are an expert code reviewer for Python.');
    expect(systemMessage).toContain('Pay close attention to PEP 8 guidelines, idiomatic Python, and performance.');
  });

  // Test 3: Edge case for an unsupported language
  it('should generate a generic system message when the language is not supported', () => {
    // Use 'as any' to bypass TypeScript's type safety for testing purposes
    languageOption.value = 'Java' as any; 
    const concept = new ReviewingConcept({ language: languageOption });

    const systemMessage = concept.getSystemMessage();
    // It should contain the base prompt but not a language-specific one
    expect(systemMessage).toContain('You are an expert code reviewer.');
    expect(systemMessage).not.toContain('You are an expert code reviewer for');
  });

  // Test 4: Primary success case for the user prompt action
  it('should correctly format the user prompt with the provided code and language', () => {
    languageOption.value = 'TypeScript';
    const concept = new ReviewingConcept({ language: languageOption });
    const codeToReview = `const greet = (name: string) => console.log(\`Hello, \${name}\`);`;

    const prompt = concept.userPrompt(codeToReview);
    const expectedPrompt = `Please review the following code snippet:
\`\`\`typescript
${codeToReview}
\`\`\``;

    expect(prompt).toBe(expectedPrompt);
  });

  // Test 5: Edge case for the user prompt with an empty input string
  it('should handle an empty code snippet in the user prompt', () => {
    languageOption.value = 'TypeScript';
    const concept = new ReviewingConcept({ language: languageOption });
    const codeToReview = '';

    const prompt = concept.userPrompt(codeToReview);
    const expectedPrompt = `Please review the following code snippet:
\`\`\`typescript

\`\`\``;

    expect(prompt).toBe(expectedPrompt);
  });
});
```
