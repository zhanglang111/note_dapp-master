var TaskManagement = artifacts.require("./TaskManagement.sol");

module.exports = function(deployer) {
    //这里的逻辑后面要大改
    deployer.deploy(TaskManagement);
};