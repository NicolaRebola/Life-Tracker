import { SearchEventTagsUseCase } from 'src/modules/events/application/use-cases/search-event-tags-use-case';
import { ListEventsValidationError } from 'src/modules/events/application/errors/list-events-validation.error';
import type { EventRepositoryPort } from 'src/modules/events/domain';

describe('SearchEventTagsUseCase', () => {
  let searchTagsByName: jest.Mock;
  let repository: EventRepositoryPort;
  let useCase: SearchEventTagsUseCase;

  beforeEach(() => {
    searchTagsByName = jest.fn().mockResolvedValue([
      { name: 'universidad', label: 'Universidad' },
      { name: 'analisis', label: 'Analisis' },
    ]);
    repository = {
      save: jest.fn(),
      findMany: jest.fn(),
      searchTagsByName,
      updateStatus: jest.fn(),
    };
    useCase = new SearchEventTagsUseCase(repository);
  });

  it('searches tags for the authenticated user by partial name', async () => {
    const result = await useCase.execute({
      userId: 'user-1',
      name: '  Uni  ',
      limit: 10,
    });

    expect(searchTagsByName).toHaveBeenCalledWith('user-1', 'uni', 10);
    expect(result).toEqual({
      items: [
        { name: 'universidad', label: 'Universidad' },
        { name: 'analisis', label: 'Analisis' },
      ],
    });
  });

  it('returns an empty list for blank searches', async () => {
    await expect(
      useCase.execute({
        userId: 'user-1',
        name: '   ',
      }),
    ).resolves.toEqual({ items: [] });

    expect(searchTagsByName).not.toHaveBeenCalled();
  });

  it('rejects invalid limits', async () => {
    await expect(
      useCase.execute({
        userId: 'user-1',
        name: 'uni',
        limit: 30,
      }),
    ).rejects.toMatchObject<ListEventsValidationError>({
      fields: ['limit'],
    });

    expect(searchTagsByName).not.toHaveBeenCalled();
  });
});
