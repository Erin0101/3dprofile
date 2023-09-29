import { GithubRepositoryService } from "../Repository/GithubRepository.ts";
import { CONSTANTS } from "../utils.ts";
import { GithubApiService } from "./GithubApiService.ts";
import { GithubAzureService } from "./GithubAzureService.ts";

export type Provider = GithubApiService | GithubAzureService;

const providers = new Map([
  ["github", GithubApiService],
  ["azure", GithubAzureService],
]);

const serviceProvider = providers.get(CONSTANTS.DEFAULT_PROVIDER);

if (serviceProvider === undefined) {
  throw new Error("Invalid provider");
}

const provider = new serviceProvider();
const repositoryClient = new GithubRepositoryService(provider).repository;

export const client = repositoryClient;
