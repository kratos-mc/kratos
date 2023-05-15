import path from "path";
import fse from "fs-extra";
import { getLauncherWorkspace } from "../app";
import { logger } from "../logger/logger";
import { v4 } from "uuid";

export module account {
  export class Account {
    private id: String;
    private name: String;

    constructor(name: String, id?: String) {
      this.name = name;
      // Generated a random unique id if the id was not provided
      this.id = id === undefined ? v4() : id;
    }

    public getId(): String {
      return this.id;
    }

    public getName(): String {
      return this.name;
    }
  }

  // Byes
  let globalAccounts: Account[];
  const ACCOUNT_FILE_PATH = path.join(
    getLauncherWorkspace().getDirectory().toString(),
    "accounts.json"
  );

  export function loadAccounts(): Account[] {
    logger.info(`Loading account from ${ACCOUNT_FILE_PATH}`);
    // Check file exists
    if (!fse.existsSync(ACCOUNT_FILE_PATH)) {
      throw new Error(`Invalid account file or not saved`);
    }
    let sanityParsedAccount = fse.readJSONSync(ACCOUNT_FILE_PATH) as {
      id: string;
      name: string;
    }[];

    return sanityParsedAccount.map(({ name, id }) => new Account(name, id));
  }

  export function getAccounts() {
    if (globalAccounts === null || globalAccounts === undefined) {
      globalAccounts = loadAccounts();
    }
    return globalAccounts;
  }

  export function saveAccounts() {
    logger.info(`Storing accounts into ${ACCOUNT_FILE_PATH}`);

    // Then check exists
    fse.writeJsonSync(ACCOUNT_FILE_PATH, globalAccounts);
  }

  export function createAccount(account: Account) {
    // Append new account
    globalAccounts.push(account);

    // Save the list of accounts
    saveAccounts();

    return account.getId();
  }

  export function initAccountFile() {
    if (!fse.existsSync(ACCOUNT_FILE_PATH)) {
      globalAccounts = [];
      saveAccounts();
    }
  }

  export function deleteAccount(id: string) {
    // Update the global account
    globalAccounts = globalAccounts.filter((account) => account.getId() !== id);
    // Store the data
    saveAccounts();
  }
}
