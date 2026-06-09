export const SEARCH_EVENT_TAGS = Symbol('SEARCH_EVENT_TAGS');

export type SearchEventTagsCommand = {
  userId: string;
  name?: string;
  limit?: number;
};

export type EventTagSuggestion = {
  name: string;
  label: string;
};

export type SearchEventTagsResult = {
  items: EventTagSuggestion[];
};

export interface SearchEventTagsPort {
  execute(command: SearchEventTagsCommand): Promise<SearchEventTagsResult>;
}
