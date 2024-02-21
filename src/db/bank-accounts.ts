import { PrismaClient } from "@prisma/client";
import { BankAccountRequest } from "@/types/request/bank-account";

const prisma = new PrismaClient();

export class BankAccountsDAO {
  static async index(player_id: number) {
    try {
      const accounts = await prisma.bankAccount.findMany({
        where: { player_id },
      });
      return accounts;
    } catch (error: any) {
      throw new Error(`Error fetching bank accounts: ${error.message}`);
    }
  }

  static async show(account_id: number) {
    try {
      const account = await prisma.bankAccount.findUnique({
        where: { id: account_id },
      });
      return account;
    } catch (error: any) {
      throw new Error(`Error fetching bank account: ${error.message}`);
    }
  }

  static async create(player_id: number, request: BankAccountRequest) {
    try {
      const account = await prisma.bankAccount.create({
        data: { player_id, ...request },
      });
      return account;
    } catch (error: any) {
      throw new Error(`Error creating bank account: ${error.message}`);
    }
  }

  static async update(account_id: number, request: BankAccountRequest) {
    try {
      const account = await prisma.bankAccount.update({
        where: { id: account_id },
        data: request,
      });
      return account;
    } catch (error: any) {
      throw new Error(`Error updating bank account: ${error.message}`);
    }
  }

  static async delete(account_id: number) {
    try {
      await prisma.bankAccount.delete({ where: { id: account_id } });
    } catch (error: any) {
      throw new Error(`Error deleting bank account: ${error.message}`);
    }
  }
}
