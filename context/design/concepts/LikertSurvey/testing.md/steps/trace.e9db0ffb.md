---
llm_model: gemini-2.5-pro
timestamp: 'Tue Oct 07 2025 21:14:54 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251007_211454.a9413577.md]]'
content_id: e9db0ffb9596e501ed5cdca1f99f9c195f147e8425581b4e13a937ded121d876
---

# trace:

The following trace demonstrates how the **principle** of the `LikertSurvey` concept is fulfilled by a sequence of actions.

1. **Given**: An author `authorA` and a respondent `respondentB`.
2. **Action**: The author creates a new survey.
   ```
   LikertSurvey.createSurvey({ author: "authorA", title: "Customer Satisfaction", scaleMin: 1, scaleMax: 5 })
   ```
3. **Result**: A new survey is created, and its ID is returned.
   ```
   { survey: "survey1" }
   ```
4. **Action**: The author adds two questions to the survey.
   ```
   LikertSurvey.addQuestion({ survey: "survey1", text: "How satisfied are you...?" })
   LikertSurvey.addQuestion({ survey: "survey1", text: "How likely are you...?" })
   ```
5. **Result**: Two new questions are created, and their IDs are returned.
   ```
   { question: "q1" }
   { question: "q2" }
   ```
6. **Action**: The respondent submits their answers to both questions.
   ```
   LikertSurvey.submitResponse({ respondent: "respondentB", question: "q1", value: 5 })
   LikertSurvey.submitResponse({ respondent: "respondentB", question: "q2", value: 4 })
   ```
7. **Result**: The responses are successfully recorded.
   ```
   {}
   {}
   ```
8. **Action**: The author queries for all responses to their survey to analyze the results.
   ```
   LikertSurvey._getSurveyResponses({ survey: "survey1" })
   ```
9. **Result**: The state reflects the submitted responses, fulfilling the concept's purpose.
   ```
   [
     { _id: ..., respondent: "respondentB", question: "q1", value: 5 },
     { _id: ..., respondent: "respondentB", question: "q2", value: 4 }
   ]
   ```
