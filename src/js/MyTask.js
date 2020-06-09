
if (window.ethereum) {
    App.web3Provider = window.ethereum;
    try {
        // Request account access
        window.ethereum.enable();
    } catch (error) {
        // User denied account access...
        console.error("User denied account access")
    }
}

// Legacy dapp browsers...
else if (window.web3) {
    App.web3Provider = window.web3.currentProvider;
}
// If no injected web3 instance is detected, fall back to Ganache
else {
    App.web3Provider = new Web3.providers.HttpProvider('http://localhost:9545');
}
web3 = new Web3(App.web3Provider);
web3.eth.defaultAccount = localStorage.getItem("defaultAccount");


var taskManagement = web3.eth.contract(JSON.parse(taskManager.abi));
var taskManagementContract = taskManagement.at(taskManager.address);

var taskList = taskManagementContract.taskList({}, {fromBlock: 0, toBlock: 'latest'});



$("#submitTask").on('click', function() {
    console.log(" click ");
});

