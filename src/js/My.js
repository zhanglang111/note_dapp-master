var taskListInfo = avalon.define({
    $id: "taskList",
    data: []
})

var web3Provider = null;
var contracts = {};
var account = null;
var noteIntance = null;//拿到合约的示例
var noteLength =0;

if (window.ethereum) {
    web3Provider = window.ethereum;
    try {
        // Request account access
        window.ethereum.enable();
    } catch (error) {
        // User denied account access...
        console.error("User denied account access")
    }
}else if (window.web3) {
    web3Provider = window.web3.currentProvider;
}
else {
    web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
}
web3 = new Web3(web3Provider);

account = getAccountParam();

if (null == account)  {
    console.log("initAccount");
    web3.eth.getAccounts(function(error, accounts) {
        account = accounts[0];
        console.log(account);
    });
} else {
    account = account;
    console.log("account:" + account);
}

function getAccountParam() {
    var reg = new RegExp("(^|&)account=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}

$.getJSON('CarContract.json', function(data) {
    contracts.noteContract = TruffleContract(data);
    contracts.noteContract.setProvider(web3Provider);
    contracts.noteContract.deployed().then(function(instance) {
        noteIntance = instance;
        noteIntance.getCarInfoLen(account).then(function(len) {
            $("#account").html("<b>一共有<b>"+len+"<b>条笔记</b>");
            // noteLength = len;
            // if (len > 0) {
            //     loadCarInfo(len - 1);
            // }
        }).catch(function(err) {
            console.log(err.message);
        });
    });
});

// function loadCarInfo() {
//     noteIntance.CarInfos(account, index).then(function(CarInfo) {
//         taskListInfo.data.push(CarInfo);
//         if (index -1 >= 0) {
//             //通过递归做出来
//             App.loadCarInfo(index - 1);
//         } else {
//             App.adjustHeight();
//         }
//     } ).catch(function(err) {
//         console.log(err.message);
//     });
// }

var taskList = noteIntance.CarInfos({}, {fromBlock: 0, toBlock: 'latest'});

taskList.watch(function(error, result){
    if(!error){
        var carInfo = {"name":result.args.name,"description":null,"reward":0,"waitTime":0,"longitude":0,"latitude":0};
        noteIntance.CarInfos(account,function(err,res){
            if(!err){ // filter
                carInfo.description = res[1];
                carInfo.reward = res[2];
                carInfo.waitTime = res[3];
                carInfo.longitude = res[4];
                carInfo.latitude = res[5];
                taskListInfo.data.push(carInfo);
            }else{
                if(err) console.log(err);
            }
        })
    }else{
        console.log(error);
    }
});




