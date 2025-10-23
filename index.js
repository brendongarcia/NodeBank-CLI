import inquirer from "inquirer";
import chalk from "chalk";
import fs from "fs";

operation();

function operation() {
  inquirer
    .prompt([     
      {
        type: "list",
        name: "action",
        message: "O que você deseja fazer?",
        choices: [
          "Criar conta",
          "Consultar saldo",
          "Depositar",
          "Sacar",
          "Sair",
        ],
      },
    ])
    .then((answer) => {
      const action = answer.action;
      if (action === "Criar conta") {
        createAccount();
      } else if (action === "Consultar saldo") {
        checkBalance();
      } else if (action === "Depositar") {
        deposit();
      } else if (action === "Sacar") {
        withdraw();
      } else {
        console.log(chalk.blue("Encerrando o sistema..."));
        process.exit();
      }
    })
    .catch((err) => console.log(err));
}

function createAccount() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Digite o nome da sua conta!",
      },
    ])
    .then((answer) => {
      const accountName = answer.accountName.trim();

      if (!fs.existsSync("accounts")) {
        fs.mkdirSync("accounts");
      }

      if (!accountName) {
        console.log(chalk.red("Nome inválido, tente novamente."));
        createAccount();
        return;
      }

      const accountPath = `accounts/${accountName}.json`;

      if (fs.existsSync(accountPath)) {
        console.log(chalk.yellow("O Usuário já existe!"));
        createAccount();
        return;
      }

      const accountData = {
        balance: 0,
      };

      fs.writeFileSync(accountPath, JSON.stringify(accountData, null, 2));
      console.log(chalk.green(`Conta "${accountName}" criada com sucesso!`));

      operation();
    })
    .catch((err) => console.log(err));
}

function checkAccount(accountName) {
  const accountPath = `accounts/${accountName}.json`;
  if (!fs.existsSync(accountPath)) {
    console.log(chalk.red("Conta não existe!"));
    return false;
  }
  return true;
}

function checkBalance() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Digite o nome da sua conta!",
      },
    ])
    .then((answer) => {
      const accountName = answer.accountName.trim();

      if (!checkAccount(accountName)) {
        operation();
        return;
      }

      const accountPath = `accounts/${accountName}.json`;

      try {
        const accountData = JSON.parse(
          fs.readFileSync(accountPath, { encoding: "utf-8" })
        );

        console.log(
          chalk.blue(`O saldo da conta ${accountName} é R$${accountData.balance}`)
        );
      } catch (err) {
        console.log(chalk.red("Erro ao ler saldo da conta:", err));
      }

      operation();
    })
    .catch((err) => console.log(err));
}


function deposit() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual conta você deseja depositar?",
      },
    ])
    .then((answer) => {
      const accountName = answer.accountName.trim();

      if (!checkAccount(accountName)) {
        operation();
        return;
      }

      inquirer
        .prompt([
          {
            name: "amount",
            message: "Quanto você deseja depositar?",
          },
        ])
        .then((answer) => {
          const amount = parseFloat(answer.amount);

          if (isNaN(amount) || amount <= 0) {
            console.log(
              chalk.red("Valor inválido.")
            );
            deposit();
            return;
          }

          const accountPath = `accounts/${accountName}.json`;
          const accountData = JSON.parse(fs.readFileSync(accountPath, "utf-8"));

          accountData.balance += amount;

          fs.writeFileSync(accountPath, JSON.stringify(accountData, null, 2));

          console.log(
            chalk.green(
              `Depósito de R$${amount} realizado com sucesso! Novo saldo: R$${accountData.balance}`
            )
          );

          operation();
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
}

function withdraw() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Digite o nome da sua conta!",
      },
    ])
    .then((answer) => {
      const accountName = answer.accountName.trim();

      if (!checkAccount(accountName)) {
        operation();
        return;
      }

      const accountPath = `accounts/${accountName}.json`;
      const accountData = JSON.parse(fs.readFileSync(accountPath, "utf-8"));
      const currentBalance = accountData.balance;

      console.log(chalk.blue(`O saldo da sua conta é R$${currentBalance}`));

      inquirer
        .prompt([
          {
            name: "amount",
            message: "Quanto você deseja sacar?",
          },
        ])
        .then((answer) => {
          const withdrawalAmount = parseFloat(answer.amount);

          if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
            console.log(chalk.red("Valor inválido para saque."));
            operation();
            return;
          }

          if (withdrawalAmount > currentBalance) {
            console.log(chalk.red("Saldo insuficiente."));
            operation();
            return;
          }

          accountData.balance -= withdrawalAmount;

          fs.writeFileSync(accountPath, JSON.stringify(accountData, null, 2));

          console.log(
            chalk.green(`Saque de R$${withdrawalAmount} realizado com sucesso!`)
          );
          console.log(chalk.blue(`Novo saldo: R$${accountData.balance}`));

          operation();
        });
    })
    .catch((err) => console.log(err));
}