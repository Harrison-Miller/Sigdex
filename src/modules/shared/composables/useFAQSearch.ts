import { computed, type Ref } from 'vue';
import type { IFAQData } from '../faq/types';

export function useFAQSearch(
    faqData: Ref<IFAQData | null>,
    searchQuery: Ref<string> | string | Ref<string[]> | string[],
    options?: {
        showFavorites?: Ref<boolean>;
        favorites?: Ref<string[]>;
    }
) {
    return computed(() => {
        if (!faqData.value?.data) return null;

        let dataToFilter = faqData.value;

        // First filter by favorites if showFavorites is enabled
        if (options?.showFavorites?.value && options?.favorites?.value) {
            const favoritedSections = faqData.value.data.map(section => {
                // Filter direct questions in the section by favorites
                const favoritedQuestions = section.questions?.filter(q =>
                    options.favorites!.value.includes(q.question)
                ) || [];

                // Filter rules and their questions by favorites
                const favoritedRules = section.rules?.map(rule => {
                    const favoritedRuleQuestions = rule.questions?.filter(q =>
                        options.favorites!.value.includes(q.question)
                    ) || [];

                    // Only include rule if it has favorited questions
                    if (favoritedRuleQuestions.length > 0) {
                        return { ...rule, questions: favoritedRuleQuestions };
                    }
                    return null;
                }).filter(rule => rule !== null) || [];

                // Only include section if it has favorited content
                const hasContent = favoritedQuestions.length > 0 || favoritedRules.length > 0;

                if (hasContent) {
                    return {
                        ...section,
                        questions: favoritedQuestions,
                        rules: favoritedRules
                    };
                }
                return null;
            }).filter(section => section !== null);

            dataToFilter = { data: favoritedSections };
        }

        // Get search query value(s) and normalize to array
        let queryValues: string[] = [];
        if (typeof searchQuery === 'string') {
            queryValues = [searchQuery];
        } else if (Array.isArray(searchQuery)) {
            queryValues = searchQuery;
        } else if ('value' in searchQuery) {
            // It's a Ref
            if (Array.isArray(searchQuery.value)) {
                queryValues = searchQuery.value;
            } else {
                queryValues = [searchQuery.value];
            }
        }

        // Filter out empty queries and convert to lowercase
        const queries = queryValues.filter(q => q && q.trim()).map(q => q.toLowerCase());

        // If no valid search queries, return the (possibly favorites-filtered) data
        if (queries.length === 0) return dataToFilter;

        // Helper function to check if text matches any query
        const matchesAnyQuery = (text: string) => {
            const lowerText = text.toLowerCase();
            return queries.some(query => lowerText.includes(query));
        };

        const filteredSections = dataToFilter.data.map(section => {
            // Check if section title contains any search query
            const sectionMatches = matchesAnyQuery(section.title);

            if (sectionMatches) {
                return section;
            }

            // Filter questions that mention any search query
            const filteredQuestions = section.questions?.filter(q =>
                matchesAnyQuery(q.question) || matchesAnyQuery(q.answer)
            ) || [];

            // Filter rules and their questions
            const filteredRules = section.rules?.map(rule => {
                const ruleMatches = matchesAnyQuery(rule.title);

                if (ruleMatches) {
                    return rule;
                }

                const filteredRuleQuestions = rule.questions?.filter(q =>
                    matchesAnyQuery(q.question) || matchesAnyQuery(q.answer)
                ) || [];

                if (filteredRuleQuestions.length > 0) {
                    return { ...rule, questions: filteredRuleQuestions };
                }
                return null;
            }).filter(rule => rule !== null) || [];

            // Only include section if it has relevant content
            const hasContent = filteredQuestions.length > 0 || filteredRules.length > 0;

            if (hasContent) {
                return {
                    ...section,
                    questions: filteredQuestions,
                    rules: filteredRules
                };
            }
            return null;
        }).filter(section => section !== null);

        return filteredSections.length > 0 ? { data: filteredSections } : null;
    });
}
