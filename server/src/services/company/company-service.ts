import { Service } from 'diod';
import pino from 'pino';

import { Logger } from '@/infrastructure/logger/logger';
import { CompanyEntity } from '@/resources/company/entity';
import { CacheProvider } from '@/services/cache/cache-provider';
import { CompanyDetailsProvider } from '@/services/company/provider/provider';
import { FixedCompaniesList } from '@/services/company/types';

@Service()
export class CompanyService {
  private logger: pino.Logger;

  constructor(
    logger: Logger,
    private cachedProvider: CacheProvider,
    private companyDetailsProvider: CompanyDetailsProvider,
  ) {
    this.logger = logger.child({ module: 'services.company' });
  }

  /**
   * Retrieves a list of companies.
   * @returns A promise that resolves to an array of CompanyEntity objects.
   */
  async getCompanies(): Promise<CompanyEntity[]> {
    try {
      const companies = await this.cachedProvider.wrap(
        'companies',
        async () => {
          const results = await Promise.all(
            FixedCompaniesList.map(async (id) =>
              this.companyDetailsProvider.getDetails(id),
            ),
          );
          return results
            .filter((result) => result.isOk())
            .map((result) => result.unwrap());
        },
      );
      return companies.map((company) => {
        this.logger.debug(
          { companyId: company.providers.tmdbId, name: company.name },
          `got company details`,
        );
        return CompanyEntity.create(company);
      });
    } catch (error) {
      this.logger.error({ error }, 'Error fetching companies');
      return [];
    }
  }
}
