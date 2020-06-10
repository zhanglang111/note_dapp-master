const { app, BrowserWindow } = require('electron')
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
//这里是使用electron
function createWindow () {
  webPreferences: {
    nodeIntegration: false
  }
  // Create the browser window.
  win = new BrowserWindow({ width: 1200, height: 700, resizable: false})

  // and load the index.html of the app.
  win.loadFile('index.html')

  // Open the DevTools.
  win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

//主进程，添加数据，这是感知车辆的添加数据
const {ipcMain} = require('electron')
// https://electronjs.org/docs/api/ipc-main
ipcMain.on('synchronous-addSensedData', (event, arg) => {
  // console.log(arg)
  addSensedData(arg).then(dataHash =>{
    event.returnValue = dataHash;
  })
})

ipcMain.on('synchronous-catSensedData', (event, arg) => {
  // console.log(arg)
  catSensedData(arg).then(fileBuffer =>{
    event.returnValue = fileBuffer;
  })
})

// save data，这个是怎么做到的，这是添加区块的时候把
async function addSensedData(sensedData){
  const filesAdded = await node.files.add({
    content: Buffer.from(sensedData)
  })
  // console.log('Added file:', filesAdded[0].path, filesAdded[0].hash)
  return filesAdded[0].hash;
}

// retrieve data
async function catSensedData(ipfsHash){
  const fileBuffer = await node.files.cat(ipfsHash);
  // console.log('Added file contents:', fileBuffer.toString())
  return fileBuffer.toString();
}

// IPFS & solc
const fs = require('fs')
const solc = require('solc')

//ipfs是星际文件系统是点到点的分布式文件，与传统的http的中心化不同，他是将文件加密碎片化分布到网络，容错机制是复制，备份完整恢复数据
//另外被加密的文件别人无法查看，所以极大保证文件的隐私性，
//数据传输上也有优势，同时发送小块数据，机器接受收自动进行拼接，更快
//ipfs也有自己的区块链(初衷是应对如果没有人上线无法分享文件，和奖励问题)即filecoin通证，华科散云
//需要文件的时候不需要再问文件的地址，而是问谁有这个文件的hash


//fs是nodejs的文件模块
const IPFS = require('ipfs')
const node = new IPFS()

node.on('ready', async () => {
  const version = await node.version();
  console.log('Version:', version.version);
});

var Web3 = require("web3");
var web3 = new Web3();
web3.setProvider(new Web3.providers.HttpProvider("http://localhost:7545"));

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}


//编译合约
function compileContract(contract_name){
  //这里是编译多个智能合约
  let source = fs.readFileSync("./contracts/" + contract_name + ".sol", 'utf8')
  console.log('=> compiling contract ' + contract_name);
  let compiledContract;
  try{
    //这里就不用我们手敲代码了，是实现了自动的编译
    compiledContract = solc.compile(source);
  }catch(err){
    console.log(err);
    return -1;
  }
  for (let contractName in compiledContract.contracts) {
    //这个类中的合约
    //得到二进制，得到abi信息，接口二进制文件
    var bytecode = compiledContract.contracts[contractName].bytecode;
    var abi = compiledContract.contracts[contractName].interface;
  }
  contract_info = {"abi": abi, "bytecode": bytecode};
  return contract_info;
}


//部署合约
function deployManagerContract(){
  let contract_info = compileContract('taskManagement');
  let bytecode = contract_info.bytecode;
  localStorage.setItem('_abi',contract_info.abi);
  let abi = JSON.parse(contract_info.abi);

  //这里不是很懂
  //执行交易，返回所使用的gas值
  web3.eth.estimateGas({data: bytecode}).then(function(gasEstimate){
    //返回节点控制的列表账户
    web3.eth.getAccounts().then(function(accounts){
      //创建了新的合约，
      let myContract = new web3.eth.Contract(abi,null,{from: accounts[0], gas: gasEstimate});
      //部署合约
      myContract.deploy({data: bytecode})
      .send({from: accounts[0], gas: gasEstimate},function(error, transactionHash){
        console.log("=> hash: " + transactionHash)
      })
      .then(function(newContractInstance){
        console.log("=> address: " + newContractInstance.options.address) // instance with the new contract address
        localStorage.setItem('_address', newContractInstance.options.address);
      });
      //部署后的hash和合约地址
    })
  });
}

if(!(localStorage.getItem('_abi') && localStorage.getItem('_address'))){
  //部署合于
  deployManagerContract();
}

ipcMain.on('synchronous-taskManager', (event, arg) => {
  taskManager().then(result =>{
    event.returnValue = result;
  })
})

async function taskManager(){
  contract_info = {"abi": localStorage.getItem('_abi'), "address": localStorage.getItem('_address')};
  return contract_info;
}

ipcMain.on('synchronous-compileTask', (event, arg) => {
  // console.log(arg)
  //arg是传入的数据
  compileTask(arg).then(res =>{
    event.returnValue = res;
  })
})


//编译合约，这是里面的一些参数
async function compileTask(args){ // json string
  var compileData = JSON.parse(args);
  let source = fs.readFileSync("./dist/contracts/sensingTaskTemplate.sol", 'utf8')

  //将参数进行替换？？
  source = source.replace(/@condition/, compileData['condition']);
  delete compileData['condition'];
  var variables = '';
  var inputs = '';
  var additionConditions = '';
  var initialization = ''
  for(var key in compileData){
    var temp = compileData[key];
    variables += temp['type'] + ' ' + temp['property'] + ' ' + key + ';\n    ';
    if(temp['type'] == 'bytes32'){
      initialization += key + ' = "' + temp['value'] + '";\n        ';
    }else{
      initialization += key + ' = ' + temp['value'] + ';\n        ';
    }
    inputs += ', ' + temp['type'] + ' _' + key;

    //添加需要的参数
    additionConditions += 'require(_' + key + ' == ' + key + ');\n        ';
  }

  //这里是在加参数
  source = source.replace(/@variables/, variables);
  source = source.replace(/@initialization/, initialization);
  source = source.replace(/@inputs/, inputs);
  source = source.replace(/@additionalCondition/, additionConditions);
  let compiledContract;

  //这里开始编译

  //solc是编译器
  try{
    compiledContract = solc.compile(source);
  }catch(err){
    console.log(err);
    return -1; // compile failed
  }

  //编译了
  for (let contractName in compiledContract.contracts) {
    var bytecode = compiledContract.contracts[contractName].bytecode;
    var abi = compiledContract.contracts[contractName].interface;
  }
  contract_info = {"abi": abi, "bytecode": bytecode};
  return JSON.stringify(contract_info);
}