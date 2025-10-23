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
        criarConta();
      } else if (action === "Consultar saldo") {
        saldo();
      } else if (action === "Depositar") {
        depositar();
      } else if (action === "Sacar") {
        sacar();
      } else {
        console.log(chalk.blue("Encerrando o sistema..."));
        process.exit();
      }
    })
    .catch((err) => console.log(err));
}

function criarConta() {
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
        criarConta();
        return;
      }

      const caminho = `accounts/${accountName}.json`;

      if (fs.existsSync(caminho)) {
        console.log(chalk.yellow("O Usuário já existe!"));
        criarConta();
        return;
      }

      const data = {
        saldo: 0,
      };

      fs.writeFileSync(caminho, JSON.stringify(data, null, 2));
      console.log(chalk.green(`Conta "${accountName}" criada com sucesso!`));

      operation();
    })
    .catch((err) => console.log(err));
}

function checkAccount(accountName) {
  const caminho = `accounts/${accountName}.json`;
  if (!fs.existsSync(caminho)) {
    console.log(chalk.red("Conta não existe!"));
    return false;
  }
  return true;
}

function saldo() {
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

      const caminho = `accounts/${accountName}.json`;

      try {
        const accountData = JSON.parse(
          fs.readFileSync(caminho, { encoding: "utf-8" })
        );

        console.log(
          chalk.blue(`O saldo da conta ${accountName} é R$${accountData.saldo}`)
        );
      } catch (err) {
        console.log(chalk.red("Erro ao ler saldo da conta:", err));
      }

      operation();
    })
    .catch((err) => console.log(err));
}


function depositar() {
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
              chalk.red("Valor inválido, digite um número positivo.")
            );
            depositar();
            return;
          }

          const caminho = `accounts/${accountName}.json`;
          const accountData = JSON.parse(fs.readFileSync(caminho, "utf-8"));

          accountData.saldo += amount;

          fs.writeFileSync(caminho, JSON.stringify(accountData, null, 2));

          console.log(
            chalk.green(
              `Depósito de R$${amount} realizado com sucesso! Novo saldo: R$${accountData.saldo}`
            )
          );

          operation();
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
}

function sacar() {
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

      const caminho = `accounts/${accountName}.json`;
      const accountData = JSON.parse(fs.readFileSync(caminho, "utf-8"));
      const saldoAtual = accountData.saldo;

      console.log(chalk.blue(`O saldo da sua conta é R$${saldoAtual}`));

      inquirer
        .prompt([
          {
            name: "amount",
            message: "Quanto você deseja sacar?",
          },
        ])
        .then((answer) => {
          const saque = parseFloat(answer.amount);

          if (isNaN(saque) || saque <= 0) {
            console.log(chalk.red("Valor inválido para saque."));
            operation();
            return;
          }

          if (saque > saldoAtual) {
            console.log(chalk.red("Saldo insuficiente."));
            operation();
            return;
          }

          accountData.saldo -= saque;

          fs.writeFileSync(caminho, JSON.stringify(accountData, null, 2));

          console.log(
            chalk.green(`Saque de R$${saque} realizado com sucesso!`)
          );
          console.log(chalk.blue(`Novo saldo: R$${accountData.saldo}`));

          operation();
        });
    })
    .catch((err) => console.log(err));
}
