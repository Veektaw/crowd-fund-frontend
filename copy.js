let account = null;
let currentProvider = null;
const statusDiv = document.getElementById("status");
const modal = document.getElementById("walletModal");

const showError = (message) => {
  statusDiv.classList.add("error");
  statusDiv.textContent = message;
};

const showStatus = (message) => {
  statusDiv.classList.remove("error");
  statusDiv.textContent = message;
};

const checkWalletAvailability = (walletType) => {
  const wallets = {
    metamask:
      typeof window.ethereum !== "undefined" && window.ethereum.isMetaMask,
    coinbase:
      typeof window.ethereum !== "undefined" &&
      window.ethereum.isCoinbaseWallet,
    solana: typeof window.solana !== "undefined",
  };
  return wallets[walletType] || false;
};

async function connectWallet(walletType) {
  try {
    if (!checkWalletAvailability(walletType)) {
      throw new Error(`${walletType} wallet not installed`);
    }

    let accounts;
    switch (walletType) {
      case "metamask":
      case "coinbase":
        accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        currentProvider = window.ethereum;
        break;
      case "solana":
        accounts = await window.solana.connect();
        currentProvider = window.solana;
        break;
    }

    account = accounts[0];
    showStatus(`Connected to ${walletType}: ${account}`);
    document.getElementById("connectButton").textContent = "Connected";
    modal.style.display = "none";
  } catch (error) {
    showError(`Failed to connect: ${error.message}`);
  }
}

async function getBalance() {
  if (!account || !currentProvider) {
    showError("Please connect a wallet first");
    return;
  }
  try {
    let balance;
    if (currentProvider === window.solana) {
      // Implement Solana balance check
      balance = "Solana balance check not implemented";
    } else {
      const web3 = new Web3(currentProvider);
      balance = await web3.eth.getBalance(account);
      balance = web3.utils.fromWei(balance, "ether") + " ETH";
    }
    showStatus(`Balance: ${balance}`);
  } catch (error) {
    showError(`Error fetching balance: ${error.message}`);
  }
}

async function sendTransaction() {
  if (!account || !currentProvider) {
    showError("Please connect a wallet first");
    return;
  }
  const amount = document.getElementById("amount").value;
  if (!amount) {
    showError("Please enter an amount");
    return;
  }
  try {
    let result;
    if (currentProvider === window.solana) {
      // Implement Solana transaction
      throw new Error("Solana transactions not implemented");
    } else {
      const web3 = new Web3(currentProvider);
      const value = web3.utils.toWei(amount, "ether");
      result = await currentProvider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: account, // Replace with recipient
            value: value,
          },
        ],
      });
    }
    showStatus(`Transaction sent: ${result}`);
  } catch (error) {
    showError(`Transaction failed: ${error.message}`);
  }
}

// Event Listeners
document.getElementById("connectButton").addEventListener("click", () => {
  modal.style.display = "block";
});

document.querySelectorAll(".wallet-option").forEach((option) => {
  option.addEventListener("click", () => {
    connectWallet(option.dataset.wallet);
  });
});

window.onclick = (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

document.getElementById("balanceButton").addEventListener("click", getBalance);
document
  .getElementById("sendButton")
  .addEventListener("click", sendTransaction);
document.getElementById("withdrawButton").addEventListener("click", () => {
  if (!account) {
    showError("Please connect a wallet first");
    return;
  }
  showStatus("Withdraw functionality needs to be implemented");
});
